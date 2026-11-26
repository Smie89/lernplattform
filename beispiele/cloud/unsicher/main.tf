# ABSICHTLICH UNSICHER – nur zum Lernen. Wird nie ausgerollt, nur von Checkov geprüft.
# Speicher für Testberichte und eine virtuelle Maschine für Testläufe in Azure.

resource "azurerm_resource_group" "test" {
  name     = "rg-testberichte"
  location = "westeurope"
}

resource "azurerm_storage_account" "berichte" {
  name                            = "testberichteunsicher"
  resource_group_name             = azurerm_resource_group.test.name
  location                        = azurerm_resource_group.test.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  https_traffic_only_enabled      = false   # Befund: unverschlüsselter Zugriff erlaubt
  min_tls_version                 = "TLS1_0" # Befund: veraltete TLS-Version
  allow_nested_items_to_be_public = true    # Befund: Container dürfen öffentlich lesbar sein
  public_network_access_enabled   = true
}

resource "azurerm_network_security_group" "testvm" {
  name                = "nsg-testvm"
  location            = azurerm_resource_group.test.location
  resource_group_name = azurerm_resource_group.test.name

  security_rule {
    name                       = "ssh-von-ueberall"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"       # Befund: SSH aus dem gesamten Internet
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "rdp-von-ueberall"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "3389"
    source_address_prefix      = "*"       # Befund: RDP aus dem gesamten Internet
    destination_address_prefix = "*"
  }
}
