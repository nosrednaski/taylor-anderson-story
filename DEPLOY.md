# Deploying to AWS S3 + CloudFront

This is a fully static site (HTML/CSS + images, no build step). These steps
deploy it to an S3 bucket fronted by a CloudFront CDN with HTTPS.

> Replace placeholder values:
> - `BUCKET=taylor-anderson-story` &mdash; must be globally unique
> - `REGION=us-east-1`
> - `PROFILE=default` &mdash; your AWS CLI profile

```bash
BUCKET=taylor-anderson-story
REGION=us-east-1
PROFILE=default
```

---

## 1. Create the S3 bucket

```bash
aws s3api create-bucket \
  --bucket "$BUCKET" \
  --region "$REGION" \
  --profile "$PROFILE"
# For regions other than us-east-1, add:
#   --create-bucket-configuration LocationConstraint="$REGION"
```

## 2. Enable static website hosting

```bash
aws s3 website "s3://$BUCKET/" \
  --index-document index.html \
  --error-document index.html \
  --profile "$PROFILE"
```

## 3. Upload all files (preserving directory structure)

Run from inside the `productionSite/` directory. `aws s3 sync` walks
subdirectories and preserves the `css/`, `images/`, and `assets/` paths.

```bash
cd productionSite

# Long-cache the static assets (images, css, pdf)
aws s3 sync . "s3://$BUCKET/" \
  --exclude "*.html" --exclude "DEPLOY.md" \
  --cache-control "public, max-age=31536000, immutable" \
  --profile "$PROFILE"

# Short-cache the HTML so content updates appear quickly
aws s3 sync . "s3://$BUCKET/" \
  --exclude "*" --include "*.html" \
  --cache-control "public, max-age=300" \
  --content-type "text/html" \
  --profile "$PROFILE"
```

> Note: `DEPLOY.md` is excluded so it is not served publicly.

## 4. Set a public-read bucket policy

If using CloudFront with Origin Access Control (recommended), you can keep the
bucket private. The policy below is the simpler public-read approach for the S3
website endpoint. Save as `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::taylor-anderson-story/*"
    }
  ]
}
```

Disable Block Public Access for the bucket, then apply:

```bash
aws s3api put-public-access-block \
  --bucket "$BUCKET" \
  --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
  --profile "$PROFILE"

aws s3api put-bucket-policy \
  --bucket "$BUCKET" \
  --policy file://bucket-policy.json \
  --profile "$PROFILE"
```

At this point the site is reachable at the S3 website endpoint:
`http://$BUCKET.s3-website-$REGION.amazonaws.com`

## 5. Create a CloudFront distribution

Easiest via the console: **CloudFront &rarr; Create distribution**
- **Origin domain:** the S3 website endpoint
  (`taylor-anderson-story.s3-website-us-east-1.amazonaws.com`), not the bucket
  REST endpoint, so S3 website routing/index behavior is preserved.
- **Default root object:** `index.html`
- **Viewer protocol policy:** Redirect HTTP to HTTPS
- **Compress objects automatically:** Yes

CLI equivalent for the default root object on an existing distribution config:

```bash
# When building the distribution config JSON, set:
#   "DefaultRootObject": "index.html"
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json \
  --profile "$PROFILE"
```

## 6. Invalidate the cache after updates

After re-running the `s3 sync` in step 3 for a content update, invalidate
CloudFront so visitors get the new files:

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*" \
  --profile "$PROFILE"
```

---

## Quick redeploy checklist

1. `cd productionSite`
2. Re-run both `aws s3 sync` commands (step 3)
3. Run the CloudFront invalidation (step 6)

## Notes

- A custom domain requires an ACM certificate **in us-east-1** plus a Route 53
  (or other DNS) record aliased to the CloudFront distribution.
- The `.avif` hero images are widely supported in modern browsers; CloudFront
  serves them as-is. `.jpg`/`.png` fallbacks exist for the other imagery.
