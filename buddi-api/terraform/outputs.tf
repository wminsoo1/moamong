output "asg_name" {
  value = aws_autoscaling_group.moamong.name
}

output "s3_bucket" {
  value = aws_s3_bucket.deploy.bucket
}

output "github_actions_role_arn" {
  value       = aws_iam_role.github_actions_role.arn
  description = "GitHub Actions 워크플로우에 설정할 AWS Role ARN"
}

output "eip_public_ip" {
  value       = "13.209.168.62"
  description = "Route53에 이미 연결된 EIP"
}
