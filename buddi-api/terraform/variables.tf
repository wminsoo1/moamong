variable "aws_region" {
  default = "ap-northeast-2"
}

variable "eip_allocation_id" {
  description = "기존 Elastic IP allocation ID"
  default     = "eipalloc-07dd399c65ab0f45f"
}

variable "ami_id" {
  description = "EC2 AMI ID"
  default     = "ami-0aef7d1237f8a3805"
}

variable "instance_type" {
  default = "t3.micro"
}

variable "key_name" {
  description = "EC2 키페어 이름"
  default     = "moamong-key"
}

variable "subnet_id" {
  description = "EC2가 위치할 서브넷"
  default     = "subnet-03cd30f9decd681f9"
}

variable "security_group_id" {
  description = "기존 보안그룹 ID"
  default     = "sg-0a3cfeb78eb922cd5"
}

variable "s3_bucket_name" {
  description = "jar 파일을 저장할 S3 버킷 이름"
  default     = "moamong-deploy"
}

variable "github_repo" {
  description = "GitHub 레포 (org/repo 형식)"
  default     = "wminsoo1/moamong"
}
