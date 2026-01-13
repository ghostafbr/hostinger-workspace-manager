#!/bin/bash

# Script de Despliegue - Nuevas Funcionalidades
# Despliega las nuevas Cloud Functions y reglas de Firestore

echo "🚀 Iniciando despliegue de nuevas funcionalidades..."

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Desplegar reglas e índices de Firestore
echo -e "${BLUE}📋 Desplegando reglas e índices de Firestore...${NC}"
firebase deploy --only firestore:rules,firestore:indexes

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Reglas e índices desplegados${NC}"
else
  echo -e "${YELLOW}⚠️  Error desplegando reglas/índices${NC}"
  exit 1
fi

# 2. Build de Cloud Functions
echo -e "${BLUE}🔨 Compilando Cloud Functions...${NC}"
cd functions
npm run build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Compilación exitosa${NC}"
else
  echo -e "${YELLOW}⚠️  Error en compilación${NC}"
  exit 1
fi

# 3. Desplegar nuevas Cloud Functions
echo -e "${BLUE}☁️  Desplegando Cloud Functions...${NC}"
firebase deploy --only functions:generateAlertsScheduled,functions:wompiWebhook

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Funciones desplegadas${NC}"
else
  echo -e "${YELLOW}⚠️  Error desplegando funciones${NC}"
  exit 1
fi

cd ..

echo ""
echo -e "${GREEN}🎉 ¡Despliegue completado!${NC}"
echo ""
echo "Funciones desplegadas:"
echo "  - generateAlertsScheduled (Scheduler - 8:00 AM diario)"
echo "  - wompiWebhook (HTTP)"
echo ""
echo "Próximos pasos:"
echo "  1. Configurar webhook en Wompi dashboard"
echo "  2. Agregar WOMPI_INTEGRITY_KEY a functions/.env"
echo "  3. Verificar logs: firebase functions:log"
echo ""
