# \[GitHub Action\] GitHub Secret Manager

<details>
  <summary><a href="https://github.com/hugoalh/GitHubAction.GitHubSecretManager"><code>hugoalh/GitHubAction.GitHubSecretManager</code></a></summary>
  <img align="center" alt="GitHub Language Count" src="https://img.shields.io/github/languages/count/hugoalh/GitHubAction.GitHubSecretManager?logo=github&logoColor=ffffff&style=flat-square" />
  <img align="center" alt="GitHub Top Langauge" src="https://img.shields.io/github/languages/top/hugoalh/GitHubAction.GitHubSecretManager?logo=github&logoColor=ffffff&style=flat-square" />
  <img align="center" alt="GitHub Repo Size" src="https://img.shields.io/github/repo-size/hugoalh/GitHubAction.GitHubSecretManager?logo=github&logoColor=ffffff&style=flat-square" />
  <img align="center" alt="GitHub Code Size" src="https://img.shields.io/github/languages/code-size/hugoalh/GitHubAction.GitHubSecretManager?logo=github&logoColor=ffffff&style=flat-square" />
  <img align="center" alt="GitHub Watcher" src="https://img.shields.io/github/watchers/hugoalh/GitHubAction.GitHubSecretManager?logo=github&logoColor=ffffff&style=flat-square" />
  <img align="center" alt="GitHub Star" src="https://img.shields.io/github/stars/hugoalh/GitHubAction.GitHubSecretManager?logo=github&logoColor=ffffff&style=flat-square" />
  <img align="center" alt="GitHub Fork" src="https://img.shields.io/github/forks/hugoalh/GitHubAction.GitHubSecretManager?logo=github&logoColor=ffffff&style=flat-square" />
</details>

A GitHub action to manage secret across repository and organization.

<table>
  <tr>
    <td><a href="./LICENSE.md"><b>License</b></a></td>
    <td>MIT</td>
  </tr>
  <tr>
    <td><a href="https://github.com/hugoalh/GitHubAction.GitHubSecretManager/releases"><b>Release</b></a> <img align="center" src="https://img.shields.io/github/downloads/hugoalh/GitHubAction.GitHubSecretManager/total?label=%20&style=flat-square" /></td>
    <td>
      <b>Latest:</b> <img align="center" src="https://img.shields.io/github/release/hugoalh/GitHubAction.GitHubSecretManager?sort=semver&label=%20&style=flat-square" /> (<img align="center" src="https://img.shields.io/github/release-date/hugoalh/GitHubAction.GitHubSecretManager?label=%20&style=flat-square" />)<br />
      <b>Pre:</b> <img align="center" src="https://img.shields.io/github/release/hugoalh/GitHubAction.GitHubSecretManager?include_prereleases&sort=semver&label=%20&style=flat-square" /> (<img align="center" src="https://img.shields.io/github/release-date-pre/hugoalh/GitHubAction.GitHubSecretManager?label=%20&style=flat-square" />)
    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/hugoalh/GitHubAction.GitHubSecretManager/graphs/contributors"><b>Contributor</b></a> <img align="center" src="https://img.shields.io/github/contributors/hugoalh/GitHubAction.GitHubSecretManager?label=%20&style=flat-square" /></td>
    <td><ul>
        <li><a href="https://github.com/hugoalh">hugoalh</a></li>
        <li><a href="https://github.com/hugoalh-studio">hugoalh Studio</a></li>
    </ul></td>
  </tr>
  <tr>
    <td><a href="https://github.com/hugoalh/GitHubAction.GitHubSecretManager/issues?q=is%3Aissue"><b>Issue</b></a></td>
    <td><img align="center" src="https://img.shields.io/github/issues-raw/hugoalh/GitHubAction.GitHubSecretManager?label=%20&style=flat-square" /> : <img align="center" src="https://img.shields.io/github/issues-closed-raw/hugoalh/GitHubAction.GitHubSecretManager?label=%20&style=flat-square" /></td>
  </tr>
  <tr>
    <td><a href="https://github.com/hugoalh/GitHubAction.GitHubSecretManager/pulls?q=is%3Apr"><b>Pull Request</b></a></td>
    <td><img align="center" src="https://img.shields.io/github/issues-pr-raw/hugoalh/GitHubAction.GitHubSecretManager?label=%20&style=flat-square" /> : <img align="center" src="https://img.shields.io/github/issues-pr-closed-raw/hugoalh/GitHubAction.GitHubSecretManager?label=%20&style=flat-square" /></td>
  </tr>
  <tr>
    <td><b>Code Quality</b></td>
    <td>
      <a href="https://www.codefactor.io/repository/github/hugoalh/githubaction.githubsecretmanager"><img align="center" alt="CodeFactor Grade" src="https://img.shields.io/codefactor/grade/github/hugoalh/GitHubAction.GitHubSecretManager?logo=codefactor&logoColor=ffffff&style=flat-square" /></a>
      <a href="https://lgtm.com/projects/g/hugoalh/GitHubAction.GitHubSecretManager/alerts"><img align="center" alt="LGTM Alert" src="https://img.shields.io/lgtm/alerts/g/hugoalh/GitHubAction.GitHubSecretManager?label=%20&logo=lgtm&logoColor=ffffff&style=flat-square" /></a>
      <a href="https://lgtm.com/projects/g/hugoalh/GitHubAction.GitHubSecretManager/context:javascript"><img align="center" alt="LGTM Grade" src="https://img.shields.io/lgtm/grade/javascript/g/hugoalh/GitHubAction.GitHubSecretManager?logo=lgtm&logoColor=ffffff&style=flat-square" /></a>
    </td>
  </tr>
</table>

## 📜 Description

### 🌟 Feature

- Simple setup.
- Support multiple mode.

## 🛠 Configuration

### 🏗 Environment

#### Operating System

Any

#### Software

- NodeJS (>= v12.13)
- NPM (>= v6.12)

#### Miscellaneous

Must be the only step in the job (to use different mode at the same time, please split as multiple jobs or workflows).

### 📥 Input

- **`token`:** `<string.secret>` GitHub personal access token. Use `"${{github.token}}"` or `"${{secrets.GITHUB_TOKEN}}"` will not work!
- **`mode` \[Optional\]:** `<string = "pushmerge">` How to manage target's secret.
  - `"exist"` Update target's secret if have the same key with source's secret. This will not delete any target's secret.
  - `"pushmerge"`/`"push"` Update target's secret if have the same key with source's secret, and create target's secret if have not the same key with source's secret. This will not delete any target's secret.
  - `"replace"` Make target's secret as same as source's secret (update target's secret if have the same key with source's secret, create target's secret if have not the same key with source's secret, and delete target's secret if have not the same key with source's secret).
- **`target`:** `<string>` Target repository(ies) and/or organization(s). Use pipe (`|`) at the start, split repository(ies) and/or organization(s) per line. Each repository must have format `$repositoryOwner$/$repositoryName$`, and each organization must have format `(org(anization)?)$organizationName$`.
  > **⚠ Important:** For security reason, action's actor and source's secret's owner (i.e.: repository owner (GitHub Action cannot run without a repository)) must be the same user.
- **`prefix` \[Optional\]:** `<string = "ghsm_">` Prefix of the secret(s) that need to use (manage), case-insensitive and must end with underscore(`_`). For more information, please visit section "[📥 Input (Manual Part)](#-Input-Manual-Part)".

### 📥 Input (Manual Part)

None of the GitHub Action can scan or import the repository secret(s) or the organization secret(s) automatically, therefore this must do manually.

Secret(s) that need to use (manage) can list in either `with` or `env` slot, but `with` will take priority when have the same key in both slot.

Secret's key is case-insensitive and can be rename. Although secret key is case-insensitive, it is recommended to use lower case in `with` and upper case in `env`.

```yaml
# Example Input
with:
  prefix: "ghsm_"
  ghsm_npm_token: "${{secrets.NPM_TOKEN}}"
env:
  GHSM_WAVE: "${{secrets.FOO_BAR}}"
  GHSM_NPM_TOKEN: "${{secrets.LOL}}"
  APPLE: "${{secrets.APPLE}}"
```
```jsonc
// Parse Result
{
  "NPM_TOKEN": "${{secrets.NPM_TOKEN}}",
  "WAVE": "${{secrets.FOO_BAR}}"
}
```

### 📤 Output

*(N/A)*

### Example

```yaml
jobs:
  secret-manage:
    name: "Update Secret"
    runs-on: "ubuntu-latest"
    steps:
      - id: "secret-manage-main"
        uses: "hugoalh/GitHubAction.GitHubSecretManager@v1.0.0"
        with:
          token: "${{secrets.GITHUB_TOKEN_FOR_GHSM}}"
          mode: "pushmerge"
          target: |
            hugoalh/GitHubAction.SendToDiscord
            hugoalh/GitHubAction.SendToIFTTT
            (org)hugoalh-studio
          prefix: "ghsm_"
          ghsm_npm_token: "${{secrets.NPM_TOKEN}}"
          ghsm_wave: "${{secrets.FOO_BAR}}"
```

### 📚 Guide

- [GitHub Actions: Enabling debug logging](https://docs.github.com/en/free-pro-team@latest/actions/managing-workflow-runs/enabling-debug-logging)
- [GitHub Actions: Encrypted secrets](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets)
