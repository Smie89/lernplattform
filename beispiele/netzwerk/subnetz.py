"""IP-Adressen und Subnetze berechnen – mit dem Modul ipaddress der Standardbibliothek.

Aufruf:  python subnetz.py 192.168.10.37/26
"""

import ipaddress
import sys


def netz_info(cidr):
    """Liefert die wichtigsten Kennzahlen eines Netzes, z. B. für '192.168.10.37/26'."""
    schnittstelle = ipaddress.ip_interface(cidr)   # Adresse + Präfix, z. B. eines Rechners
    netz = schnittstelle.network
    if netz.num_addresses > 2:
        # Rechnen statt auflisten: ein /8-Netz hätte sonst 16 Millionen Einträge.
        erster, letzter = netz.network_address + 1, netz.broadcast_address - 1
        anzahl = netz.num_addresses - 2          # ohne Netz- und Broadcastadresse
    else:
        hosts = list(netz.hosts())               # /31 und /32: Sonderfälle, alle Adressen nutzbar
        erster, letzter, anzahl = hosts[0], hosts[-1], len(hosts)
    return {
        "adresse": str(schnittstelle.ip),
        "netz": str(netz),
        "maske": str(netz.netmask),
        "broadcast": str(netz.broadcast_address),
        "erster_host": str(erster),
        "letzter_host": str(letzter),
        "anzahl_hosts": anzahl,
        "privat": schnittstelle.ip.is_private,
    }


def im_selben_netz(adresse_a, adresse_b, praefix):
    """Können zwei Rechner direkt (ohne Router) miteinander sprechen?"""
    netz_a = ipaddress.ip_interface(f"{adresse_a}/{praefix}").network
    return ipaddress.ip_address(adresse_b) in netz_a


def aufteilen(cidr, neues_praefix):
    """Teilt ein Netz in gleich große Teilnetze auf, z. B. /24 in vier /26."""
    return [str(teil) for teil in ipaddress.ip_network(cidr).subnets(new_prefix=neues_praefix)]


if __name__ == "__main__":
    for schluessel, wert in netz_info(sys.argv[1] if len(sys.argv) > 1 else "192.168.10.37/26").items():
        print(f"{schluessel:<13} {wert}")
