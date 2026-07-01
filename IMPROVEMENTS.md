# Improvements

This document captures possible improvements for Element Finder, ranked from quick wins and high-impact changes through to nice-to-have enhancements.

## Quick Wins / High Impact

1. Clarify the empty states in the dashboard UI.

   In `src/Pixelbuilders.Umbraco.ElementFinder/Client/src/element-finder-dashboard.ts`, separate the first-load state from a completed search with no results.

2. Improve client-side error handling.

   In `src/Pixelbuilders.Umbraco.ElementFinder/Client/src/datasources/get-info.datasource.ts`, stop collapsing API failures into `null` or empty arrays without preserving useful error context.

3. Decide whether generated `wwwroot` assets should be committed.

   Either keep generated backoffice assets committed and document that release builds should refresh them, or ignore them and make the package build fully responsible for producing them.

## Strong Next Improvements

4. Add automated tests for content usage detection.

   The scanning logic in `src/Pixelbuilders.Umbraco.ElementFinder/Element-finder.cs` is the package's core behavior and should have tests for direct document type usage, block usage, compositions, invalid JSON, and no-match scenarios.

5. Improve performance of content scanning.

   The API currently walks content and parses property JSON in-process. Consider narrowing scanned properties, reducing repeated content-type work, and introducing caching or batched lookups for larger sites.

6. Tighten TypeScript typing around workspace data.

   Replace fragile `any` usage in `src/Pixelbuilders.Umbraco.ElementFinder/Client/src/element-finder.ts` and `src/Pixelbuilders.Umbraco.ElementFinder/Client/src/element-finder-dashboard.ts` with stronger Umbraco backoffice types where available.

7. Add linting and formatting for the client app.

   Add a lightweight TypeScript lint/format workflow so the client code stays consistent and catches avoidable issues before package builds.

8. Improve result browsing in the UI.

   Add client-side filtering, sorting, or clearer pagination controls so large result sets are easier to work with.

## Packaging And Documentation

9. Align package metadata with the actual package version.

   Keep `src/Pixelbuilders.Umbraco.ElementFinder/wwwroot/umbraco-package.json`, NuGet metadata, and package release versioning in sync.

10. Add CI validation.

    Add checks for client build, package build, and basic solution restore/build validation so package structure changes are caught early.

11. Add a smoke-test path for the example site.

    A lightweight validation against the example site would help confirm the RCL static web assets, backoffice entry point, and API client all still work together.

## Nice To Have

12. Review localization quality.

    The localization structure is in place, but the translations should be reviewed for natural phrasing and consistency by native or fluent speakers.

13. Consider whether both UI entry points are needed.

    The package currently has both a document-type workspace view and a content-section dashboard. If both remain, document the purpose of each and make their labels/UX clearly distinct.

14. Add richer result metadata.

    Include document type alias, path, update date, culture/variant, or publishing state in API results if those details help editors understand where usage occurs.

15. Add optional scan configuration.

    A future version could allow administrators to exclude document types, property editors, or content branches from scanning.
