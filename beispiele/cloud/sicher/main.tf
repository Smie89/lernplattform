# Dieselben Ressourcen, die Befunde behoben.

resource "azurerm_resource_group" "test" {
  name     = "rg-testberichte"
  location = "westeurope"
}

resource "azurerm_storage_account" "berichte" {
  # Bewusst akzeptierte Befunde – jeweils mit Begründung (wie "# nosec" bei Bandit):
  #checkov:skip=CKV_AZURE_33:Queue-Dienst wird nicht genutzt
  #checkov:skip=CKV_AZURE_206:LRS genügt, Testberichte lassen sich jederzeit neu erzeugen
  #checkov:skip=CKV2_AZURE_1:Keine kritischen Daten, von Microsoft verwaltete Schlüssel genügen
  #checkov:skip=CKV2_AZURE_33:Private Endpoint wird im Netzwerkmodul angelegt, nicht Teil dieses Beispiels
  name                            = "testberichtesicher"
  resource_group_name             = azurerm_resource_group.test.name
  location                        = azurerm_resource_group.test.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  https_traffic_only_enabled      = true
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false
  public_network_access_enabled   = false   # Zugriff nur über das interne Netz (Private Endpoint)
  shared_access_key_enabled       = false   # Anmeldung über Entra ID statt geteilter Kontoschlüssel

  sas_policy {
    expiration_period = "01.00:00:00"       # geteilte Zugriffslinks laufen nach einem Tag ab
  }

  blob_properties {
    delete_retention_policy {
      days = 7                              # gelöschte Berichte 7 Tage wiederherstellbar
    }
    container_delete_retention_policy {
      days = 7
    }
  }
}

resource "azurerm_network_security_group" "testvm" {
  name                = "nsg-testvm"
  location            = azurerm_resource_group.test.location
  resource_group_name = azurerm_resource_group.test.name

  security_rule {
    name                       = "ssh-nur-aus-dem-firmennetz"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "10.20.0.0/16"   # nur aus dem eigenen Netz (z. B. über VPN)
    destination_address_prefix = "*"
  }
}
