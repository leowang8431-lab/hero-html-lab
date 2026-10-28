param([string]$RepositoryUrl)
# Run after creating an empty GitHub repository. No token is stored here.
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
if (-not $RepositoryUrl) {
  $RepositoryUrl = Read-Host 'Paste the empty GitHub repository HTTPS URL'
}
if ($RepositoryUrl -notmatch '^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+(?:\.git)?/?$') {
  throw 'Use an HTTPS repository URL such as https://github.com/your-name/hero-html-lab.git'
}
Get-Command git -ErrorAction Stop | Out-Null
if (-not (Test-Path -LiteralPath '.git')) {
  & git init -b main
  if ($LASTEXITCODE -ne 0) { throw 'Git initialization failed.' }
}
& git var GIT_AUTHOR_IDENT *> $null
if ($LASTEXITCODE -ne 0) {
  throw 'Set git config user.name and user.email, then run this script again.'
}
& git add --all
if ($LASTEXITCODE -ne 0) { throw 'Unable to stage the website files.' }
& git diff --cached --quiet
if ($LASTEXITCODE -eq 1) {
  & git commit -m 'Complete HERO LAB course website'
  if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }
}
$ExistingUrl = & git remote get-url github 2>$null
if ($LASTEXITCODE -eq 0) {
  if ($ExistingUrl.TrimEnd('/') -ne $RepositoryUrl.TrimEnd('/')) {
    throw 'A different github remote already exists. Check git remote -v before changing it.'
  }
} else {
  & git remote add github $RepositoryUrl
  if ($LASTEXITCODE -ne 0) { throw 'Unable to add the GitHub remote.' }
}
& git push -u github main
if ($LASTEXITCODE -ne 0) { throw 'Push failed. Check your GitHub login, repository permissions, and whether the repository is empty.' }
Write-Host 'Website pushed to GitHub successfully.'
