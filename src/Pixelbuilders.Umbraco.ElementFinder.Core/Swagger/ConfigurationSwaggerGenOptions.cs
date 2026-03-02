using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ElementFinder.Core.Swagger
{
    internal class ConfigureSwaggerGenOptions : IConfigureOptions<SwaggerGenOptions>
    {
        public void Configure(SwaggerGenOptions options)
        {
            options.SwaggerDoc(
                "element-finder",
                new OpenApiInfo
                {
                    Title = "Element Finder Api",
                    Version = "1.0",
                });

            options.OperationFilter<BackOfficeSecurityRequirementsOperationFilter>();
        }
    }
}
