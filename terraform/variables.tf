variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "eu-west-2"
}

variable "bucket_name" {
  description = "S3 bucket name for website hosting"
  type        = string
  default     = "brigid-personal-assistant-app"
}

variable "domain_name" {
  description = "Domain name for the website"
  type        = string
  default     = "brigid-personal-assistant.com"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100" # Use PriceClass_All for global distribution
}
