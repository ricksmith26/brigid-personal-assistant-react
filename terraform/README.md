# Terraform Infrastructure for Brigid Personal Assistant

This Terraform configuration deploys a React application to AWS using S3, CloudFront, Route53, and ACM for SSL certificates.

## Architecture

- **S3 Bucket**: Hosts the static React application files
- **CloudFront**: CDN for global content delivery with HTTPS
- **Route53**: DNS management for custom domain
- **ACM Certificate**: SSL/TLS certificate for HTTPS (in us-east-1 for CloudFront)

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **Terraform** >= 1.0 installed
3. **AWS CLI** configured with credentials
4. **Domain registered** - `brigid-personal-assistant.com` should be registered
5. **Route53 Hosted Zone** - The domain should already have a hosted zone in Route53

## Initial Setup

### 1. Configure AWS Credentials

You have two options:

#### Option A: AWS CLI Profile
```bash
aws configure --profile brigid-assistant
export AWS_PROFILE=brigid-assistant
```

#### Option B: Environment Variables
```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"
```

### 2. Verify Route53 Hosted Zone

Check if your domain has a hosted zone:
```bash
aws route53 list-hosted-zones-by-name --dns-name brigid-personal-assistant.com
```

If not, create one:
```bash
aws route53 create-hosted-zone --name brigid-personal-assistant.com --caller-reference $(date +%s)
```

**Important**: Update your domain registrar's nameservers to point to the Route53 nameservers.

### 3. Initialize Terraform

```bash
cd terraform
terraform init
```

### 4. Review and Customize Variables

Edit `variables.tf` or create a `terraform.tfvars` file:

```hcl
aws_region              = "us-east-1"
bucket_name             = "brigid-personal-assistant-app"
domain_name             = "brigid-personal-assistant.com"
environment             = "production"
cloudfront_price_class  = "PriceClass_100"
```

### 5. Plan Infrastructure

```bash
terraform plan
```

### 6. Apply Infrastructure

```bash
terraform apply
```

This will:
1. Create an S3 bucket
2. Request an ACM certificate
3. Create DNS validation records in Route53
4. Wait for certificate validation (can take 5-30 minutes)
5. Create CloudFront distribution
6. Create DNS records pointing to CloudFront

**Note**: The initial deployment can take 20-45 minutes due to certificate validation and CloudFront distribution provisioning.

### 7. Verify Deployment

After Terraform completes:

```bash
terraform output
```

You should see:
- S3 bucket name
- CloudFront distribution ID
- Website URL

## GitHub Actions Setup

### 1. Create IAM Role for GitHub Actions

Create an IAM role with OIDC provider for GitHub Actions:

```bash
# Create OIDC provider (one time per AWS account)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1

# Create trust policy file
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/brigid-personal-assistant-react:*"
        }
      }
    }
  ]
}
EOF

# Create the IAM role
aws iam create-role \
  --role-name GitHubActionsBrigidAssistant \
  --assume-role-policy-document file://trust-policy.json

# Attach necessary policies
aws iam attach-role-policy \
  --role-name GitHubActionsBrigidAssistant \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-role-policy \
  --role-name GitHubActionsBrigidAssistant \
  --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess
```

### 2. Configure GitHub Secrets

Go to your GitHub repository settings and add these secrets:

1. **AWS_ROLE_ARN**: ARN of the IAM role created above
   - Format: `arn:aws:iam::YOUR_ACCOUNT_ID:role/GitHubActionsBrigidAssistant`

2. **S3_BUCKET_NAME**: Get from Terraform output
   ```bash
   terraform output -raw s3_bucket_name
   ```

3. **CLOUDFRONT_DISTRIBUTION_ID**: Get from Terraform output
   ```bash
   terraform output -raw cloudfront_distribution_id
   ```

### 3. Add Environment Variables (Optional)

If your React app needs environment variables, add them to the workflow file:

Edit `.github/workflows/deploy.yml` and add under the "Build application" step:
```yaml
env:
  VITE_API_URL: ${{ secrets.VITE_API_URL }}
  VITE_OTHER_VAR: ${{ secrets.VITE_OTHER_VAR }}
```

## Deployment Workflows

### Automatic Deployment

Push to `main` branch triggers automatic deployment:
```bash
git add .
git commit -m "Deploy changes"
git push origin main
```

### Manual Deployment

Trigger deployment manually from GitHub Actions tab using "workflow_dispatch"

## Maintenance

### Update Infrastructure

1. Modify Terraform files
2. Run `terraform plan` to review changes
3. Run `terraform apply` to apply changes

### View CloudFront Distribution

```bash
aws cloudfront get-distribution --id $(terraform output -raw cloudfront_distribution_id)
```

### Invalidate CloudFront Cache

```bash
aws cloudfront create-invalidation \
  --distribution-id $(terraform output -raw cloudfront_distribution_id) \
  --paths "/*"
```

### View S3 Bucket Contents

```bash
aws s3 ls s3://$(terraform output -raw s3_bucket_name)/
```

## Costs

Estimated monthly costs (low traffic):
- **S3**: $0.023 per GB + $0.005 per 1,000 requests
- **CloudFront**: $0.085 per GB (first 10 TB) + $0.01 per 10,000 requests
- **Route53**: $0.50 per hosted zone
- **ACM Certificate**: Free

Typical monthly cost for a small app: **$1-10**

## Troubleshooting

### Certificate Validation Stuck

If certificate validation takes longer than 30 minutes:
1. Check Route53 records were created correctly
2. Verify nameservers at domain registrar match Route53
3. DNS propagation can take up to 48 hours

### CloudFront 403 Errors

1. Check S3 bucket policy allows CloudFront access
2. Verify files exist in S3 bucket
3. Check CloudFront origin settings

### GitHub Actions Deployment Fails

1. Verify IAM role ARN is correct
2. Check IAM role has necessary permissions
3. Ensure secrets are configured in GitHub

### Domain Not Resolving

1. Check Route53 records point to CloudFront
2. Verify domain nameservers point to Route53
3. Test DNS: `dig brigid-personal-assistant.com`

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

**Warning**: This will delete:
- S3 bucket and all contents
- CloudFront distribution
- Route53 records (but not the hosted zone)
- ACM certificate

## Security Best Practices

1. **Enable S3 versioning** for backup/recovery
2. **Enable CloudFront logging** for monitoring
3. **Use least-privilege IAM policies**
4. **Enable AWS CloudTrail** for audit logs
5. **Review CloudFront security headers**
6. **Rotate AWS credentials regularly**

## Additional Resources

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [GitHub Actions AWS Integration](https://github.com/aws-actions/configure-aws-credentials)
