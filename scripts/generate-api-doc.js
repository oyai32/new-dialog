import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

// 生成统一的 API 文档
async function generateApiDoc() {
  console.log('开始生成 API 文档...')
  
  const componentsDir = path.join(projectRoot, 'src/components')
  const outputFile = path.join(projectRoot, 'docs/api.md')
  
  // 确保目录存在
  if (!fs.existsSync(componentsDir)) {
    console.error('组件目录不存在:', componentsDir)
    return
  }
  
  // 读取所有组件文件
  const componentFiles = fs.readdirSync(componentsDir)
    .filter(file => file.endsWith('.vue'))
    .sort()
  
  if (componentFiles.length === 0) {
    console.warn('未找到任何组件文件')
    return
  }
  
  let apiContent = `<!-- 
将自动生成 \`src/components\` 目录下组件的 API 文档，请勿修改。
-->

## 目录

${componentFiles.map(file => {
  const name = path.basename(file, '.vue')
  return `- [${name}](#${name.toLowerCase()})`
}).join('\n')}

---

`
  
  // 解析每个组件
  for (const file of componentFiles) {
    const componentName = path.basename(file, '.vue')
    const componentPath = path.join(componentsDir, file)
    const source = fs.readFileSync(componentPath, 'utf-8')
    
    const componentDoc = parseComponent(source, componentName)
    apiContent += componentDoc + '\n\n---\n\n'
    
    console.log(`✓ 已解析 ${componentName}`)
  }
  
  // 写入文件
  fs.writeFileSync(outputFile, apiContent, 'utf-8')
  console.log(`\n✅ API 文档已生成: ${outputFile}`)
}

// 解析组件
function parseComponent(source, componentName) {
  const props = parseProps(source)
  const emits = parseEmits(source)
  const slots = parseSlots(source)
  
  let doc = `## ${componentName}\n\n`
  
  // Props
  doc += `### Props\n\n`
  if (props.length > 0) {
    doc += `| 参数 | 类型 | 默认值 | 是否必填 | 说明 |\n`
    doc += `|------|------|--------|---------|------|\n`
    for (const prop of props) {
      const required = prop.required ? '是' : '否'
      const defaultValue = prop.default || '-'
      doc += `| ${prop.name} | \`${prop.type}\` | ${defaultValue} | ${required} | ${prop.description || '-'} |\n`
    }
  } else {
    doc += `无\n`
  }
  
  doc += `\n`
  
  // Events
  doc += `### Events\n\n`
  if (emits.length > 0) {
    doc += `| 事件名 | 参数 | 说明 |\n`
    doc += `|--------|------|------|\n`
    for (const emit of emits) {
      doc += `| ${emit.name} | \`${emit.parameters}\` | ${emit.description || '-'} |\n`
    }
  } else {
    doc += `无\n`
  }
  
  doc += `\n`
  
  // Slots
  doc += `### Slots\n\n`
  if (slots.length > 0) {
    doc += `| 插槽名 | 说明 |\n`
    doc += `|--------|------|\n`
    for (const slot of slots) {
      doc += `| ${slot.name} | ${slot.description || '-'} |\n`
    }
  } else {
    doc += `无\n`
  }
  
  return doc
}

// 解析 Props
function parseProps(source) {
  const props = []
  
  // 查找 export interface XXXProps
  const propsInterfaceMatch = source.match(/export interface (\w+Props)\s*\{([^}]+)\}/s)
  if (!propsInterfaceMatch) return props
  
  const propsContent = propsInterfaceMatch[2]
  
  // 匹配多行格式：/** 说明 */ 属性名?: 类型
  // 或者单行格式：/** 说明 */\n 属性名?: 类型
  const propRegex = /\/\*\*\s*(.+?)\s*\*\/\s*(\w+)\??:\s*([^\n]+)/g
  let match
  
  while ((match = propRegex.exec(propsContent)) !== null) {
    const [, description, name, type] = match
    props.push({
      name,
      type: type.trim().replace(/,$/, ''),
      description: description.trim(),
      required: !propsContent.substring(match.index).includes(`${name}?:`),
      default: null
    })
  }
  
  // 如果上面的匹配没找到，尝试匹配分开的格式（注释和属性在不同行）
  if (props.length === 0) {
    const lines = propsContent.split('\n')
    let currentDescription = ''
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // 匹配注释行
      const commentMatch = line.match(/\/\*\*\s*(.+?)\s*\*\//)
      if (commentMatch) {
        currentDescription = commentMatch[1].trim()
        continue
      }
      
      // 匹配属性定义行
      const propMatch = line.match(/(\w+)\??:\s*(.+)/)
      if (propMatch && currentDescription) {
        const [, name, type] = propMatch
        props.push({
          name,
          type: type.trim().replace(/,$/, ''),
          description: currentDescription,
          required: !line.includes('?'),
          default: null
        })
        currentDescription = ''
      }
    }
  }
  
  // 查找 withDefaults 中的默认值
  const defaultsMatch = source.match(/withDefaults\(defineProps<\w+Props>\(\),\s*\{([^}]+)\}\)/s)
  if (defaultsMatch) {
    const defaultsContent = defaultsMatch[1]
    const defaultLines = defaultsContent.split('\n')
    for (const line of defaultLines) {
      const match = line.match(/(\w+):\s*(.+),?$/)
      if (match) {
        const prop = props.find(p => p.name === match[1])
        if (prop) {
          prop.default = match[2].trim().replace(/,$/, '')
        }
      }
    }
  }
  
  return props
}

// 解析 Emits
function parseEmits(source) {
  const emits = []
  
  // 匹配 defineEmits<{ ... }>
  const emitsMatch = source.match(/defineEmits<\s*\{([^}]+)\}\s*>/s)
  if (!emitsMatch) return emits
  
  const emitsContent = emitsMatch[1]
  const lines = emitsContent.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//')) continue
    
    // 匹配 /** 说明 */ 事件名: [参数]
    const jsdocMatch = trimmed.match(/\/\*\*\s*(.+?)\s*\*\/\s*(\w+):\s*\[(.+)\]/)
    if (jsdocMatch) {
      const [, description, name, parameters] = jsdocMatch
      emits.push({
        name,
        parameters: parameters.trim(),
        description: description.trim()
      })
    } else {
      // 匹配不带注释的 事件名: [参数]
      const simpleMatch = trimmed.match(/(\w+):\s*\[(.+)\]/)
      if (simpleMatch) {
        emits.push({
          name: simpleMatch[1],
          parameters: simpleMatch[2].trim(),
          description: ''
        })
      }
    }
  }
  
  return emits
}

// 解析 Slots
function parseSlots(source) {
  const slots = []
  
  // 查找所有 <slot> 标签
  const slotRegex = /<slot(?:\s+name=["']([^"']+)["'])?[^>]*>/g
  let match
  
  while ((match = slotRegex.exec(source)) !== null) {
    const name = match[1] || 'default'
    // 查找插槽的注释说明（在 slot 标签前的注释）
    const beforeSlot = source.substring(0, match.index)
    const commentMatch = beforeSlot.match(/\/\*\*\s*(.+?)\s*\*\/\s*$/s)
    
    slots.push({
      name,
      description: commentMatch ? commentMatch[1].trim() : `${name === 'default' ? '默认' : name} 插槽`
    })
  }
  
  // 去重
  return slots.filter((slot, index, self) => 
    index === self.findIndex(s => s.name === slot.name)
  )
}

// 运行
generateApiDoc().catch(console.error)


