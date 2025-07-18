variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "AWS Key Pair name for SSH access"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the application (optional)"
  type        = string
  default     = ""
}
