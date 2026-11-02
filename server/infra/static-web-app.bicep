@description('Static Web App resource name.')
param staticSiteName string = 'cableworm-web'

@description('Supported Static Web Apps region; change to match subscription availability.')
param location string = 'westus2'

resource staticSite 'Microsoft.Web/staticSites@2025-03-01' = {
  name: staticSiteName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
  tags: {
    project: 'CableWorm'
    managedBy: 'Bicep'
  }
}

output siteUrl string = 'https://${staticSite.properties.defaultHostname}'
output resourceId string = staticSite.id
