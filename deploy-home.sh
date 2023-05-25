touch netlify.toml
echo '[build]
  command = "solid-start build"
  functions = "netlify/functions"
  publish = "netlify"
[dev]
  command = "solid-start dev"
  port = 3000
  ## more info on configuring this file: https://www.netlify.com/docs/netlify-toml-reference/' > netlify.toml

npm run build:home