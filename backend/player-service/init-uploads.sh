#!/bin/sh

echo "🚀 Initializing uploads directory..."

# Créer le dossier si nécessaire
mkdir -p /app/uploads/profilePictures

# Chemin de l'image par défaut
DEFAULT_PICTURE="/app/uploads/profilePictures/default_profile_picture.png"

# Vérifier si l'image par défaut existe déjà
if [ -f "$DEFAULT_PICTURE" ]; then
    echo "✅ Default profile picture already exists"
else
    echo "📥 Downloading default profile picture..."
    
    # Télécharger l'image par défaut
    wget -q -O "$DEFAULT_PICTURE" \
        "https://ui-avatars.com/api/?name=Default+User&size=400&background=1a73e8&color=ffffff&format=png" \
        || curl -s -o "$DEFAULT_PICTURE" \
        "https://ui-avatars.com/api/?name=Default+User&size=400&background=1a73e8&color=ffffff&format=png"
    
    if [ -f "$DEFAULT_PICTURE" ]; then
        echo "✅ Default profile picture created successfully"
        ls -lh "$DEFAULT_PICTURE"
    else
        echo "❌ Failed to create default profile picture"
        echo "⚠️  Creating a placeholder..."
        
        # Créer un PNG minimal comme fallback (1x1 pixel gris)
        # En base64 : un PNG 1x1 gris
        echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > "$DEFAULT_PICTURE"
        
        echo "⚠️  Placeholder created (1x1 pixel). Consider replacing with a proper image."
    fi
fi

echo "📁 Uploads directory contents:"
ls -lh /app/uploads/profilePictures/

echo "🎬 Starting application..."
exec "$@"