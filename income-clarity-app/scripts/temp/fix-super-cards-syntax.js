#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix syntax errors in Super Cards components
function fixSuperCardsComponents() {
  console.log('🔧 Fixing Super Cards component syntax errors...');

  const componentsToFix = [
    'components/super-cards/IncomeIntelligenceHub.tsx',
    'components/super-cards/FinancialPlanningHub.tsx',
    'components/super-cards/PortfolioStrategyHub.tsx',
    'components/super-cards/TaxStrategyHub.tsx'
  ];

  for (const filePath of componentsToFix) {
    if (fs.existsSync(filePath)) {
      console.log(`Fixing ${filePath}...`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Common fixes for all components
      
      // Fix broken JSX tags with > symbol issues
      content = content.replace(/(\w+)>\s*&gt;/g, '$1>');
      content = content.replace(/>\s*&gt;/g, '>');
      
      // Fix missing closing div tags
      if (content.includes('DataSourceBadge source="MANUAL" size="sm" />')) {
        content = content.replace(
          /<DataSourceBadge source="MANUAL" size="sm" \/>\s*<\/div>\s*<\/div>/,
          '<DataSourceBadge source="MANUAL" size="sm" />\n            </div>\n          </div>\n        </div>'
        );
      }
      
      // Specific fixes for IncomeIntelligenceHub
      if (filePath.includes('IncomeIntelligenceHub')) {
        // Fix the broken tab navigation section
        content = content.replace(
          /(<div className="hidden sm:flex items-center gap-2">\s*<DataSourceBadge source="MANUAL" size="sm" \/>\s*<\/div>\s*<\/div>)/,
          '$1\n\n        {/* Tab Navigation */}\n        <div className="overflow-x-auto">\n          <div className="flex space-x-1 mb-6 bg-slate-100 p-1 rounded-lg min-w-max">\n            {TABS.map((tab) => (\n              <button\n                key={tab.id}\n                onClick={() => setActiveTab(tab.id)}\n                className={`flex-1 min-w-0 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${\n                  activeTab === tab.id\n                    ? `${tab.bgColor} ${tab.color} shadow-sm`\n                    : \'text-slate-600 hover:text-slate-900 hover:bg-white\'\n                }`}\n              >\n                <div className="flex items-center justify-center space-x-2">\n                  <tab.icon className="w-4 h-4" />\n                  <span className="hidden sm:inline">{tab.label}</span>\n                </div>\n              </button>\n            ))}\n          </div>\n        </div>'
        );
      }
      
      // Write the fixed content
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${filePath}`);
    } else {
      console.log(`⚠️ File not found: ${filePath}`);
    }
  }

  console.log('🎉 Super Cards syntax fix completed!');
}

// Run if called directly
if (require.main === module) {
  fixSuperCardsComponents();
}

module.exports = { fixSuperCardsComponents };