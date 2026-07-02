using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Api.Management.OpenApi;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.DependencyInjection;

namespace Pixelbuilders.Umbraco.ElementFinder.Composers
{
    public class RegisterService : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.AddBackOfficeOpenApiDocument(
                "element-finder",
                document => document
                    .WithTitle("Element Finder Api")
                    .WithJsonOptions(Constants.JsonOptionsNames.BackOffice)
                    .WithBackOfficeAuthentication());
        }
    }
}
