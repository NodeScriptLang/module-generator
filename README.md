# Module Generator

**Status: experimental**

## Sources of API specifications:

https://apis.guru/

## How to

[Squad ADA docs](https://github.com/ubio/squad-nodescript/blob/main/docs/Third%20Party%20Libraries%20Module%20Generator.md)

TLDR

1. Generate spes from openapi:

```
npm run generate:openapi -- --in=openapi/<api-name>.json --out=specs/<api-name>.yaml
```

2. Generate libraries

```
npm run generate:library -- --in=specs/<api-name>.yaml
```

3. Publish libraries

```
NODE_ENV=<env> FORCE_PUBLISH=true npm run publish:library -- --in=specs/<api-name>.yaml
```
