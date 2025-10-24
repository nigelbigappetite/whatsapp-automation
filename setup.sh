#!/bin/bash

echo "🚀 Setting up WhatsApp Automation for Wefixico"
echo "=============================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your actual values."
    echo ""
    echo "Required values to set in .env:"
    echo "- SUPABASE_URL (from your Supabase dashboard)"
    echo "- SUPABASE_SERVICE_ROLE_KEY (from your Supabase dashboard)"
    echo "- WPP_URL (usually http://localhost:8080)"
    echo "- WPP_API_KEY (your WPPConnect secret)"
    echo "- WEBHOOK_SECRET (your webhook secret)"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building TypeScript..."
npm run build

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run the SQL script 'setup-wefixico-brand.sql' in your Supabase dashboard"
echo "2. Update your .env file with actual values"
echo "3. Set up WPPConnect (see WPPCONNECT_SETUP.md)"
echo "4. Start your app: npm run dev"
echo ""
echo "For detailed setup instructions, see:"
echo "- README.md (general setup)"
echo "- WPPCONNECT_SETUP.md (WPPConnect setup)"
echo "- setup-wefixico-brand.sql (database setup)"
