#!/bin/bash
# SwiftPen 安装脚本 (Bash)
# 使用方法: ./install.sh "/path/to/your/vault"

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}==================================${NC}"
echo -e "${CYAN}SwiftPen 插件安装脚本${NC}"
echo -e "${CYAN}==================================${NC}"
echo ""

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}❌ 错误: 请提供 Vault 路径${NC}"
    echo "使用方法: ./install.sh \"/path/to/your/vault\""
    exit 1
fi

VAULT_PATH="$1"

# 检查 vault 路径是否存在
if [ ! -d "$VAULT_PATH" ]; then
    echo -e "${RED}❌ 错误: Vault 路径不存在: $VAULT_PATH${NC}"
    exit 1
fi

# 检查是否是有效的 Obsidian vault
OBSIDIAN_DIR="$VAULT_PATH/.obsidian"
if [ ! -d "$OBSIDIAN_DIR" ]; then
    echo -e "${RED}❌ 错误: 这不是一个有效的 Obsidian Vault${NC}"
    echo -e "${RED}   未找到 .obsidian 目录${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 找到 Obsidian Vault: $VAULT_PATH${NC}"

# 创建插件目录
PLUGINS_DIR="$OBSIDIAN_DIR/plugins"
if [ ! -d "$PLUGINS_DIR" ]; then
    echo -e "${YELLOW}→ 创建 plugins 目录...${NC}"
    mkdir -p "$PLUGINS_DIR"
fi

TARGET_DIR="$PLUGINS_DIR/swiftpen"

# 检查是否已安装
if [ -d "$TARGET_DIR" ]; then
    read -p "⚠ SwiftPen 已安装。是否覆盖? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}取消安装${NC}"
        exit 0
    fi
    echo -e "${YELLOW}→ 删除旧版本...${NC}"
    rm -rf "$TARGET_DIR"
fi

# 检查是否存在 dist 目录
SOURCE_DIR="dist"
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}❌ 错误: 未找到 dist 目录${NC}"
    echo -e "${YELLOW}请先运行: npm run build${NC}"
    exit 1
fi

# 检查必要文件是否存在
REQUIRED_FILES=("main.js" "manifest.json")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$SOURCE_DIR/$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${RED}❌ 错误: dist 目录中缺少必要文件:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo -e "${RED}   - $file${NC}"
    done
    echo ""
    echo -e "${YELLOW}请先运行: npm run build${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 所有必要文件存在${NC}"

# 创建目标目录
echo -e "${YELLOW}→ 创建插件目录...${NC}"
mkdir -p "$TARGET_DIR"

# 复制文件
echo -e "${YELLOW}→ 复制文件...${NC}"
cp "$SOURCE_DIR/main.js" "$TARGET_DIR/"
cp "$SOURCE_DIR/manifest.json" "$TARGET_DIR/"

# 检查是否有 styles.css
if [ -f "$SOURCE_DIR/styles.css" ]; then
    cp "$SOURCE_DIR/styles.css" "$TARGET_DIR/"
    echo -e "${GREEN}  ✓ 复制 styles.css${NC}"
fi

echo ""
echo -e "${CYAN}==================================${NC}"
echo -e "${GREEN}✅ 安装成功!${NC}"
echo -e "${CYAN}==================================${NC}"
echo ""
echo -e "${CYAN}下一步:${NC}"
echo -e "${NC}1. 打开 Obsidian${NC}"
echo -e "${NC}2. 进入 设置 → 社区插件${NC}"
echo -e "${NC}3. 找到 SwiftPen 并启用${NC}"
echo -e "${NC}4. 在 SwiftPen 设置中配置 API Key${NC}"
echo ""
echo -e "${YELLOW}快捷键: Ctrl+Shift+L${NC}"
echo ""

