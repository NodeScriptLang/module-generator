# Module Generator

**Status: experimental**

## Sources of API specifications:

https://apis.guru/

## How to

[Squad ADA docs](https://github.com/ubio/squad-nodescript/blob/main/docs/Third%20Party%20Libraries%20Module%20Generator.md)

TLDR

1. Generate specs from openapi:

```
npm run generate:openapi -- --in=openapi/<api-name>.json --out=specs/<api-name>.yaml
```

2. Generate libraries

```
npm run generate:library -- --in=specs/<api-name>.yaml
```

3. Publish libraries (See [Nodescript publishing](#nodescript-publishing) for more info.)

```
NODE_ENV=<env> FORCE_PUBLISH=true npm run publish:library -- --in=specs/<api-name>.yaml
```

## Nodescript publishing

Both in production and development, you will need to set up a service account in NodeScript in the workspace created for the published modules:

1. In Nodescript, navigate to the desired workspace, then `Settings` > `service accounts` and create a service account with `WORKSPACE_MODULES_PUBLISH` and `WORKSPACE_MODULES_VIEW` scopes.
2. On the new service account, generate a key, ensure you copy the key as you'll need it shortly.

### Local dev:

1. Create/update a file in `./secrets/development/` directory named `config.json`, then inside create/update the object following this format:

```
{
    "<module title>": "<key>"
}
```

Add your module title as per the spec filename from `./specs`, omitting the file extension, and set the value to your generated key from NodeScript. Save the file.

2. Run the publish command outlined in [How to](#how-to), setting the `NODE_ENV` to `development`.

### Production:

1. Ensure you have sops installed (See [Sops](#sops) for more info.)
2. There should already be a file in `./secrets/production` named `config.json`, which is encrypted. Edit the file using [Sops](#sops). While editing you should see file contents in this format:

```
{
    "google-docs": "<key>",
    "bigquery": "<key>",
    "youtube": "<key>",
    // ...etc
}
```

Add your module title as per the spec filename from `./specs`, omitting the file extension, and set the value to your generated key from NodeScript. Save/Write and exit the editor.

3. Run the publish command outlined in [How to](#how-to), setting the `NODE_ENV` to `production`.

4. Commit your changes.

### SOPS

Secrets are managed using [SOPS](https://github.com/getsops/sops). Installing SOPS is required to edit the secrets locally.

1. Install SOPS:

    ```
    brew install sops
    ```

2. Log into GCloud:

    ```
    gcloud auth login
    gcloud auth application-default login
    ```

3. Edit the secrets file with sops:

    ```
    sops ./secrets/production/config.json
    ```
