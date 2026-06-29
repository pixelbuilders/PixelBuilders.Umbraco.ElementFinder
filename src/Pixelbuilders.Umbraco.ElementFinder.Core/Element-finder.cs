using Asp.Versioning;
using ElementFinder.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pixelbuilders.Umbraco.ElementFinder.Core.Models;
using System.Text.Json;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Common.Filters;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Routing;

namespace ElementFinder.Core
{
    [ApiController]
    [ApiVersion("1.0")]
    [MapToApi("element-finder")]
    [Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
    [JsonOptionsName(Constants.JsonOptionsNames.BackOffice)]
    [BackOfficeRoute("element-finder/api/v{version:apiVersion}")]
    public class DocumentTypeUsageController : Controller
    {
        private readonly IContentService _contentService;
        private readonly IContentTypeService _contentTypeService;
        private readonly IPublishedUrlProvider _publishedUrlProvider;
        private readonly IUmbracoContextFactory _umbracoContextFactory;

        public DocumentTypeUsageController(
            IContentService contentService,
            IContentTypeService contentTypeService,
            IPublishedUrlProvider publishedUrlProvider,
            IUmbracoContextFactory umbracoContextFactory)
        {
            _contentService = contentService;
            _contentTypeService = contentTypeService;
            _publishedUrlProvider = publishedUrlProvider;
            _umbracoContextFactory = umbracoContextFactory;
        }

        [HttpGet("all-types")]
        [MapToApiVersion("1.0")]
        [ProducesResponseType(typeof(List<Elements>), 200)]
        public List<Elements> GetAllDocumentTypes()
        {
            // Fetch all Document Types and Elements
            return _contentTypeService.GetAll()
                .Select(x => new Elements
                {
                    Name = x.Name,
                    Alias = x.Alias,
                }).OrderBy(x => x.Name).ToList();
        }

        [HttpGet("usage/{alias}")]
        [MapToApiVersion("1.0")]
        [ProducesResponseType(typeof(Usage), 200)]
        public Usage GetUsage(string alias)
        {
            var contentType = _contentTypeService.Get(alias);
            if (contentType == null)
                return EmptyUsage();

            var documentTypeIds = new HashSet<int>();
            var elementKeys = new HashSet<Guid>();

            // Direct document type
            if (!contentType.IsElement)
                documentTypeIds.Add(contentType.Id);

            // Direct element type
            if (contentType.IsElement)
                elementKeys.Add(contentType.Key);

            // Composition handling
            var composedTypes = _contentTypeService
                .GetAll()
                .Where(ct => ct.ContentTypeComposition
                    .Any(c => c.Key == contentType.Key));

            foreach (var ct in composedTypes)
            {
                if (ct.IsElement)
                    elementKeys.Add(ct.Key);
                else
                    documentTypeIds.Add(ct.Id);
            }

            if (!documentTypeIds.Any() && !elementKeys.Any())
                return EmptyUsage();

            var results = new List<Details>();
            var matchedIds = new HashSet<int>();

            using var context = _umbracoContextFactory.EnsureUmbracoContext();
            var publishedCache = context.UmbracoContext.Content;

            foreach (var content in GetAllContent())
            {
                var published = publishedCache?.GetById(content.Id);
                if (published == null)
                    continue;

                bool matched = false;

                // 1️ Direct Document Type match
                if (documentTypeIds.Contains(content.ContentTypeId))
                {
                    matched = true;
                }
                // 2️ Block element match
                else if (elementKeys.Any())
                {
                    foreach (var property in content.Properties)
                    {
                        if (property.GetValue() is not string rawValue)
                            continue;

                        if (!rawValue.Contains("contentData") &&
                            !rawValue.Contains("settingsData"))
                            continue;

                        if (ContainsElementWithKeys(rawValue, elementKeys))
                        {
                            matched = true;
                            break;
                        }
                    }
                }

                if (!matched)
                    continue;

                if (!matchedIds.Add(content.Id))
                    continue;

                results.Add(new Details
                {
                    PageName = published.Name,
                    Url = _publishedUrlProvider.GetUrl(published),
                    Id = published.Key.ToString()
                });
            }

            return new Usage
            {
                Usages = results
            };
        }

        // =====================================================
        // JSON BLOCK SCANNING
        // =====================================================

        private static bool ContainsElementWithKeys(string rawValue, HashSet<Guid> elementKeys)
        {
            if (string.IsNullOrWhiteSpace(rawValue))
                return false;

            try
            {
                using var doc = JsonDocument.Parse(rawValue);
                var root = doc.RootElement;

                return CheckProperty(root, "contentData", elementKeys)
                    || CheckProperty(root, "settingsData", elementKeys);
            }
            catch (JsonException)
            {
                return false;
            }
        }

        private static bool CheckProperty(JsonElement root, string propertyName, HashSet<Guid> elementKeys)
        {
            if (!root.TryGetProperty(propertyName, out var data))
                return false;

            if (data.ValueKind != JsonValueKind.Array)
                return false;

            foreach (var block in data.EnumerateArray())
            {
                if (block.ValueKind != JsonValueKind.Object)
                    continue;

                if (!block.TryGetProperty("contentTypeKey", out var keyProp))
                    continue;

                if (!keyProp.TryGetGuid(out var blockKey))
                    continue;

                if (elementKeys.Contains(blockKey))
                    return true;
            }

            return false;
        }

        // =====================================================
        // CONTENT PAGING HELPERS
        // =====================================================

        private IEnumerable<IContent> GetAllContent()
        {
            var pageIndex = 0;
            const int pageSize = 500;
            var results = new List<IContent>();

            do
            {
                var page = _contentService.GetPagedDescendants(
                    -1,
                    pageIndex,
                    pageSize,
                    out long total);

                results.AddRange(page);
                pageIndex++;

                if (results.Count >= total)
                    break;

            } while (true);

            return results;
        }

        private static Usage EmptyUsage()
            => new Usage { Usages = Enumerable.Empty<Details>() };
    }
}
