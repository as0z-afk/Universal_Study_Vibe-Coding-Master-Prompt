# Universal Study Platform Prompts

Two subject-neutral prompts for creating an accessible, responsive study platform from materials for any course. They adapt to the supplied course and actual project without prescribing a subject area or fixed curriculum. This repository contains prompts, not a generated learning application.

## Choose a prompt

- **Short prompt** — [`prompts/Universal_Study_Platform_Vibe_Coding_Prompt_9400.txt`](prompts/Universal_Study_Platform_Vibe_Coding_Prompt_9400.txt): exactly 9,400 Unicode characters, including spaces and line breaks. Use with systems that impose a prompt-length limit.
- **Full master prompt** — [`prompts/Universal_Study_Platform_Master_Prompt_40000.md`](prompts/Universal_Study_Platform_Master_Prompt_40000.md): exactly 40,000 Unicode characters, including Markdown syntax, spaces, and line breaks. Use for the complete specification.

## Use

Provide one prompt to your coding agent together with the course materials relevant to the current task. Have it inspect the target project's actual files and runtime before making changes. The prompt is designed to adapt to that project rather than assume a particular framework, package, or architecture.

## Publish to GitHub

Create an empty GitHub repository, then run these commands from this folder. Replace `OWNER` and `REPOSITORY` with your GitHub account and repository name.

```bash
git init
git add README.md .gitignore prompts/
git commit -m "Add universal study platform prompts"
git branch -M main
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

