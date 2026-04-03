#!/bin/bash

# Couleurs pour les logs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Test Player Service ===${NC}\n

# 1. Créer un utilisateur
echo -e "${BLUE}1. Creating user via Auth service...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "password": "password123",
    "username": "test_user",
    "email": "test@example.com"
  }')

echo "$REGISTER_RESPONSE" | jq .

# Extraire l'UUID
UUID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')
echo -e "${GREEN}UUID: $UUID${NC}\n"

# 2. Vérifier le joueur existe
echo -e "${BLUE}2. Getting player...${NC}"
curl -s http://localhost:3001/players/$UUID | jq .
echo ""


# 3. Modifier le username
echo -e "${BLUE}3. Patching username...${NC}"
curl -s -X PATCH http://localhost:3001/players/$UUID \
  -H "Content-Type: application/json" \
  -d '{"username": "patched_only_username"}' | jq .
echo ""

# 4. Modifier l'email
echo -e "${BLUE}4. Patching email...${NC}"
curl -s -X PATCH http://localhost:3001/players/$UUID \
  -H "Content-Type: application/json" \
  -d '{"email": "patched_only@example.com"}' | jq .
echo ""

# 5. Modifier les deux
echo -e "${BLUE}5. Patching both...${NC}"
curl -s -X PATCH http://localhost:3001/players/$UUID \
  -H "Content-Type: application/json" \
  -d '{"username": "final_patched_username", "email": "final_patched@example.com"}' | jq .
echo ""

# 6. Test erreur : aucun champ
echo -e "${BLUE}6. Testing error (no fields)...${NC}"
curl -s -X PATCH http://localhost:3001/players/$UUID \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
echo ""

# 8. Supprimer le joueur
echo -e "${BLUE}8. Deleting player...${NC}"
curl -s -X DELETE http://localhost:3001/players/$UUID -w "\nStatus: %{http_code}\n"
echo ""


# 9. Vérifier la suppression
echo -e "${BLUE}9. Verifying deletion...${NC}"
curl -s http://localhost:3001/players/$UUID | jq .
echo ""

echo -e "${GREEN}=== Tests completed ===${NC}"