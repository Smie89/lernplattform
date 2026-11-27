import pytest


@pytest.fixture(scope="session")
def base_url(shop_url):
    """pytest-playwright nutzt base_url für page.goto("/") – hier aus SHOP_URL."""
    return shop_url
