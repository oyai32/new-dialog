import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// 生成 API 文档的脚本
async function generateApiDocs() {
  console.log('开始生成 API 文档...')
  
  try {
    // 使用 vue-docgen-api 解析组件
    const componentsDir = path.join(process.cwd(), 'src/components')
    const outputDir = path.join(process.cwd(), 'docs/components')
    
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    // 读取组件文件
    const componentFiles = fs.readdirSync(componentsDir)
      .filter(file => file.endsWith('.vue'))
    
    for (const file of componentFiles) {
      const componentName = path.basename(file, '.vue')
      const componentPath = path.join(componentsDir, file)
      
      // 读取组件源码
      const source = fs.readFileSync(componentPath, 'utf-8')
      
      // 解析组件信息
      const apiDoc = generateComponentApi(source, componentName)
      
      // 写入 API 文档
      const apiFilePath = path.join(outputDir, `${componentName.toLowerCase()}.md`)
      fs.writeFileSync(apiFilePath, apiDoc)
      
      console.log(`已生成 ${componentName} 的 API 文档`)
    }
    
    console.log('API 文档生成完成!')
  } catch (error) {
    console.error('生成 API 文档时出错:', error)
  }
}

function generateComponentApi(source, componentName) {
  // 解析 props
  const propsMatch = source.match(/export interface (\w+Props) \{([^}]+)\}/)
  const props = propsMatch ? parseProps(propsMatch[2]) : []
  
  // 解析 emits
  const emitsMatch = source.match(/defineEmits<\{([^}]+)\}>\(\)/)
  const emits = emitsMatch ? parseEmits(emitsMatch[1]) : []
  
  // 解析 slots
  const slots = parseSlots(source)
  
  return `# ${componentName} API

## Props

${props.length > 0 ? generatePropsTable(props) : '无'}

## Events

${emits.length > 0 ? generateEventsTable(emits) : '无'}

## Slots

${slots.length > 0 ? generateSlotsTable(slots) : '无'}

## 使用示例

\`\`\`vue
<template>
  <${componentName} />
</template>

<script setup>
import { ${componentName} } from '@/components'
</script>
\`\`\`
`
}

function parseProps(propsString) {
  const props = []
  const lines = propsString.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('/**') && !trimmed.startsWith('*')) {
      const match = trimmed.match(/\/\*\* (.+) \*\/\s*(\w+)\??:\s*(.+)/)
      if (match) {
        props.push({
          name: match[2],
          type: match[3],
          description: match[1],
          required: !trimmed.includes('?')
        })
      }
    }
  }
  
  return props
}

function parseEmits(emitsString) {
  const emits = []
  const lines = emitsString.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('/**') && !trimmed.startsWith('*')) {
      const match = trimmed.match(/\/\*\* (.+) \*\/\s*(\w+):\s*\[(.+)\]/)
      if (match) {
        emits.push({
          name: match[2],
          parameters: match[3],
          description: match[1]
        })
      }
    }
  }
  
  return emits
}

function parseSlots(source) {
  const slots = []
  const slotMatches = source.match(/<slot[^>]*name="([^"]*)"[^>]*>/g)
  
  if (slotMatches) {
    for (const match of slotMatches) {
      const nameMatch = match.match(/name="([^"]*)"/)
      if (nameMatch) {
        slots.push({
          name: nameMatch[1] || 'default',
          description: '默认插槽'
        })
      }
    }
  }
  
  return slots
}

function generatePropsTable(props) {
  let table = '| 参数 | 类型 | 默认值 | 说明 |\n'
  table += '|------|------|--------|------|\n'
  
  for (const prop of props) {
    table += `| ${prop.name} | ${prop.type} | - | ${prop.description} |\n`
  }
  
  return table
}

function generateEventsTable(emits) {
  let table = '| 事件名 | 参数 | 说明 |\n'
  table += '|--------|------|------|\n'
  
  for (const emit of emits) {
    table += `| ${emit.name} | ${emit.parameters} | ${emit.description} |\n`
  }
  
  return table
}

function generateSlotsTable(slots) {
  let table = '| 插槽名 | 说明 |\n'
  table += '|--------|------|\n'
  
  for (const slot of slots) {
    table += `| ${slot.name} | ${slot.description} |\n`
  }
  
  return table
}

// 运行脚本
generateApiDocs()
