using Microsoft.Extensions.DependencyInjection;
using Pixelbuilders.Umbraco.ElementFinder.Swagger;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace Pixelbuilders.Umbraco.ElementFinder.Composers
{
    public class RegisterService : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.ConfigureOptions<ConfigureSwaggerGenOptions>();
        }
    }
}
