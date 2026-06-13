resource "aws_ssm_parameter" "grafana_alloy_token" {
  name  = "/moamong/grafana-alloy-token"
  type  = "SecureString"
  value = var.grafana_alloy_token
}
