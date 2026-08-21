import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// 生成 Changelog 的脚本
async function generateChangelog() {
  console.log('开始生成 Changelog...')
  
  try {
    const cwd = process.cwd()
    const pkgPath = path.join(cwd, 'package.json')
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    const version = pkg.version
    const tagName = `v${version}`

    // 找到上一个 tag（若不存在则生成全量）
    const lastTag = getLastTagSafe()

    // 获取 git 提交记录
    const range = lastTag ? `${lastTag}..HEAD` : ''
    const commits = getGitCommits(range)
    // 解析提交记录，生成分组
    const changelog = buildChangelog({ version, commits })
    // 写入 changelog 文件
    const changelogPath = path.join(process.cwd(), 'docs/changelog.md')
    const changelogDir = path.dirname(changelogPath)
    if (!fs.existsSync(changelogDir)) {
      fs.mkdirSync(changelogDir, { recursive: true })
    }
    fs.writeFileSync(changelogPath, changelog)
    
    console.log('Changelog 生成完成!')
  } catch (error) {
    console.error('生成 Changelog 时出错:', error)
  }
}

function getGitCommits(range = '') {
  try {
    // 获取最近的提交记录
    const cmd = range
      ? `git log ${range} --pretty=format:'%h %s'`
      : `git log --pretty=format:'%h %s'`
    const gitLog = execSync(cmd, { 
      encoding: 'utf-8',
      cwd: process.cwd()
    })
    
    return gitLog.split('\n').filter(line => line.trim())
  } catch (error) {
    console.warn('无法获取 git 提交记录:', error.message)
    return []
  }
}

function buildChangelog({ version, commits }) {
  const date = new Date().toISOString().split('T')[0]
  let content = `<!-- 
本文档会根据提交记录自动更新，请勿修改。
-->
# 更新日志\n\n`
  content += `## ${version} (${date})\n\n`

  if (commits.length === 0) {
    content += '暂无提交记录\n'
    return content
  }

  // 类型映射与显示标题
  const typeTitles = {
    feat: 'Features',
    fix: 'Bug Fixes',
    docs: 'Documentation',
    style: 'Styles',
    refactor: 'Refactors',
    perf: 'Performance',
    test: 'Tests',
    chore: 'Chores',
    other: 'Other Changes'
  }

  // 分组
  const groups = {}
  for (const line of commits) {
    const parsed = parseCommitMessage(line)
    // 过滤发布相关的 chore 提交，如 'chore: release %s' 或 'chore: prepare release'
    if (parsed.type === 'chore' && /(prepare\s+release|release\b|%s)/i.test(parsed.message)) {
      continue
    }
    const type = parsed.type in typeTitles ? parsed.type : 'other'
    if (!groups[type]) groups[type] = []
    groups[type].push(parsed)
  }

  // 输出各分组（按常见顺序）
  const order = ['feat', 'fix', 'perf', 'refactor', 'docs', 'style', 'test', 'chore', 'other']
  for (const t of order) {
    const items = groups[t]
    if (!items || items.length === 0) continue
    content += `### ${typeTitles[t]}\n\n`
    for (const item of items) {
      content += `- ${item.message} (${item.hash})\n`
    }
    content += '\n'
  }

  return content
}

function groupCommitsByDate(commits) {
  const grouped = {}
  
  for (const commit of commits) {
    try {
      // 获取提交日期
      const hash = commit.split(' ')[0]
      if (hash && hash !== '*') {
        const date = execSync(`git show -s --format=%ci ${hash}`, { 
          encoding: 'utf-8',
          cwd: process.cwd()
        }).trim().split(' ')[0]
        
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(commit)
      }
    } catch (error) {
      // 忽略无法获取日期的提交
    }
  }
  
  return grouped
}

function parseCommitMessage(commit) {
  // 解析提交信息，支持 conventional commits
  // 形如："a043097 feat(scope): 描述" 或 "a043097 feat: 描述"
  const firstSpace = commit.indexOf(' ')
  const hash = firstSpace > 0 ? commit.slice(0, firstSpace) : ''
  const subject = firstSpace > 0 ? commit.slice(firstSpace + 1) : commit
  
  // 匹配类型和描述
  const match = subject.match(/^(feat|fix|docs|style|refactor|perf|test|chore)(\(([^)]+)\))?:\s+(.+)/)
  
  if (match) {
    return {
      type: match[1],
      scope: match[3] || '',
      message: match[4],
      hash
    }
  }
  
  return {
    type: 'other',
    scope: '',
    message: subject,
    hash
  }
}

function getCommitEmoji(type) {
  const emojiMap = {
    feat: '✨',
    fix: '🐛',
    docs: '📚',
    style: '💄',
    refactor: '♻️',
    perf: '⚡️',
    test: '🧪',
    chore: '🔧',
    other: '📝'
  }
  
  return emojiMap[type] || '📝'
}

function getLastTagSafe() {
  try {
    const tag = execSync('git describe --tags --abbrev=0', {
      encoding: 'utf-8',
      cwd: process.cwd()
    }).trim()
    return tag || null
  } catch (e) {
    return null
  }
}

// 运行脚本
generateChangelog()
