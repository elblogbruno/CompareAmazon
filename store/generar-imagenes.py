"""Renderiza la interfaz real con datos ficticios; no consulta Amazon ni publica nada.

Requiere Pillow, Playwright y su Chromium instalado.
Ejecutar desde la raíz: python store/generar-imagenes.py
"""
import io
import json
import math
import zipfile
from pathlib import Path
from urllib.parse import quote

from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'store' / 'chrome-web-store'
OUT.mkdir(exist_ok=True)
FONT = Path('C:/Windows/Fonts')


def font(size, bold=False):
    return ImageFont.truetype(str(FONT / ('segoeuib.ttf' if bold else 'segoeui.ttf')), size)


def headphone(color):
    # Ilustración vectorial propia de un producto ficticio, sin marcas de terceros.
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="420" height="290" viewBox="0 0 420 290">
    <defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="{color}"/><stop offset="1" stop-color="#172036"/></linearGradient>
    <filter id="s"><feGaussianBlur stdDeviation="7"/></filter></defs>
    <ellipse cx="210" cy="265" rx="100" ry="9" fill="#111827" opacity=".12" filter="url(#s)"/>
    <path d="M111 169V126a99 99 0 0 1 198 0v43" fill="none" stroke="#222b3e" stroke-width="26"/>
    <path d="M112 130a98 98 0 0 1 196 0" fill="none" stroke="{color}" stroke-width="18"/>
    <path d="M114 136v63M306 136v63" stroke="#a6afbd" stroke-width="10"/>
    <g transform="rotate(-9 119 201)"><rect x="83" y="146" width="66" height="105" rx="28" fill="url(#g)"/>
    <rect x="132" y="153" width="22" height="92" rx="11" fill="#222b3e"/><path d="M96 174v49" stroke="white" opacity=".15" stroke-width="4" stroke-linecap="round"/></g>
    <g transform="rotate(9 301 201)"><rect x="271" y="146" width="66" height="105" rx="28" fill="url(#g)"/>
    <rect x="266" y="153" width="22" height="92" rx="11" fill="#222b3e"/><path d="M323 174v49" stroke="white" opacity=".15" stroke-width="4" stroke-linecap="round"/></g></svg>'''
    return 'data:image/svg+xml,' + quote(svg)


def products():
    result = []
    for i, (name, color, price, rating, count, battery, weight) in enumerate([
        ('Sound One · Auriculares inalámbricos', '#454c65', 59.99, 4.3, 1240, '40 h', '230 g'),
        ('Sound Pro · Cancelación de ruido', '#72869b', 89.99, 4.7, 860, '60 h', '250 g'),
        ('Sound Air · Ligeros y plegables', '#b0957c', 74.99, 4.5, 2180, '50 h', '195 g'),
    ]):
        result.append(dict(
            asin=f'DEMO00000{i}', url=f'https://www.amazon.es/dp/DEMO00000{i}',
            domain='amazon.es', title=name, brand='Sound (ejemplo)',
            image=headphone(color), priceNum=price,
            priceDisplay=f'{price:.2f} €'.replace('.', ','), ratingNum=rating,
            reviewCount=count, isPrime=True, availability='En stock',
            specs={'Autonomía': battery, 'Peso': weight, 'Conectividad': 'Bluetooth 5.3',
                   'Cancelación de ruido': ['Pasiva', 'Activa adaptativa', 'Activa'][i],
                   'Carga rápida': ['10 min → 4 h', '10 min → 8 h', '10 min → 5 h'][i],
                   'Conexión multipunto': ['No', 'Sí', 'Sí'][i],
                   'Formato': 'Diadema plegable'},
            **(dict(couponText='Cupón de 10 %', netPriceNum=80.99, netPriceDisplay='80,99 €') if i == 1 else {})
        ))
    return result


def gradient(size):
    w, h = size
    im = Image.new('RGB', size)
    px = im.load()
    for y in range(h):
        for x in range(w):
            glow = max(0, 1 - math.hypot((x-w*.87)/w, (y-h*.15)/h))
            px[x, y] = (int(16+30*glow), int(23+23*glow), int(45+85*glow))
    return im


def logo(draw, x, y, size):
    draw.rounded_rectangle((x, y, x+size, y+size), radius=size//4, fill='#6366f1')
    for off in (.25, .55):
        draw.rounded_rectangle((x+int(size*off), y+int(size*.24), x+int(size*(off+.19)), y+int(size*.76)), radius=2, outline='white', width=max(2, size//22))


def screenshot_frame(raw, title, subtitle, index):
    im = gradient((1280, 800))
    d = ImageDraw.Draw(im)
    d.text((48, 20), f'COMPAREAMAZON   /   {index:02d}', font=font(15, True), fill='#b9baff')
    d.text((48, 43), title, font=font(41, True), fill='white')
    d.text((48, 102), subtitle, font=font(19), fill='#cbd5e1')
    d.text((1093, 23), 'Datos de ejemplo', font=font(15), fill='#cbd5e1')
    shot = raw.convert('RGB').resize((1184, 625), Image.Resampling.LANCZOS)
    im.paste(shot, (48, 153))
    return im


def make_promo(size, raw):
    w, h = size
    im = gradient(size)
    d = ImageDraw.Draw(im)
    if w == 440:
        logo(d, 25, 24, 35)
        d.text((70, 23), 'CompareAmazon', font=font(27, True), fill='white')
        d.text((25, 83), 'Compara mejor.', font=font(34, True), fill='white')
        d.text((25, 126), 'Decide más fácil.', font=font(34, True), fill='white')
        d.text((26, 181), 'Tus productos de Amazon, en una tabla.', font=font(18), fill='#d1d5ed')
        for x, label, width in [(26, 'Precios', 93), (129, 'Diferencias', 119), (258, 'Prompt IA', 113)]:
            d.rounded_rectangle((x, 226, x+width, 259), radius=16, fill='#373b72')
            d.text((x+14, 230), label, font=font(16, True), fill='#e0e7ff')
    else:
        logo(d, 58, 51, 46)
        d.text((118, 49), 'CompareAmazon', font=font(33, True), fill='white')
        d.text((58, 151), 'Menos pestañas.', font=font(51, True), fill='white')
        d.text((58, 217), 'Más claridad.', font=font(51, True), fill='white')
        d.text((60, 306), 'Compara productos de Amazon', font=font(24), fill='#d5d9ed')
        d.text((60, 341), 'y elige con toda la información.', font=font(24), fill='#d5d9ed')
        d.rounded_rectangle((58, 413, 503, 459), radius=23, fill='#4f46e5')
        d.text((79, 421), 'Precios  ·  Diferencias  ·  Prompt IA', font=font(21, True), fill='white')
        shot = raw.resize((712, 376), Image.Resampling.LANCZOS)
        im.paste(shot, (635, 92))
        d.text((1157, 511), 'Datos de ejemplo', font=font(16), fill='#b9c1da')
    return im


def main():
    captures = []
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1440, 'height': 760}, device_scale_factor=1, locale='es-ES')
        page.on('pageerror', lambda error: errors.append(str(error)))
        # Solo archivos locales: impide llamadas a cuentas, Amazon o servicios externos.
        page.route('https://**/*', lambda route: route.fulfill(status=200, content_type='application/json', body='{"user":null}'))
        state = {'compareData': {'products': products(), 'failed': []}, 'theme': 'light', 'lang': 'es'}
        page.add_init_script('''const demoState = ''' + json.dumps(state) + ''';
            window.chrome = {storage: {local: {
                get: async () => demoState,
                set: async values => Object.assign(demoState, values),
                remove: async key => {delete demoState[key]}
            }}, runtime: {getURL: path => new URL(path, location.href).href}};
        ''')
        page.goto((ROOT / 'compare.html').as_uri())
        page.locator('.product-main-img').first.wait_for()
        page.evaluate('Promise.all([...document.images].map(i => i.decode().catch(() => {})))')

        def take(filename, title, subtitle):
            page.evaluate('document.activeElement.blur()')
            raw = Image.open(io.BytesIO(page.screenshot(animations='disabled'))).convert('RGB')
            screenshot_frame(raw, title, subtitle, len(captures)+1).save(OUT / filename)
            captures.append(filename)
            return raw

        raw = take('01-comparativa-1280x800.png', 'Tus productos, cara a cara.', 'Precios, cupones y valoraciones en una sola tabla.')
        page.locator('#diffOnlyToggle').check()
        # Desplazamiento real hasta las especificaciones; conserva cabeceras fijas.
        page.locator('tr').filter(has=page.locator('th', has_text='Autonomía')).first.scroll_into_view_if_needed()
        take('02-diferencias-1280x800.png', 'Encuentra lo que marca la diferencia.', 'Activa «Solo diferencias» y compara las especificaciones que te importan.')
        page.evaluate('window.scrollTo(0, 0)')
        page.locator('#tableWrapper').evaluate('(el) => {el.scrollTop = 0}')
        page.locator('#diffOnlyToggle').uncheck()
        page.locator('#aiMenuBtn').click()
        page.locator('#openAiModalBtn').click()
        page.locator('#userContextInput').fill('Busco auriculares para trabajar y viajar. Mi presupuesto es de 90 €. Prioriza cancelación de ruido, comodidad y autonomía.')
        take('03-inteligencia-artificial-1280x800.png', 'Tu próxima compra, con ayuda de IA.', 'Personaliza el prompt y llévalo a ChatGPT, Claude, Gemini o Perplexity.')
        page.locator('#closeAiModalBtn').click()
        page.locator('#openShareModalBtn').click()
        take('04-compartir-1280x800.png', 'Comparte la decisión.', 'Enlaces compartibles con cuenta, PDF, resumen de texto, HTML y CSV.')
        page.locator('#closeShareModalBtn').click()
        page.locator('#themeToggleBtn').click()
        page.locator('#maxBudgetInput').fill('85')
        page.locator('#maxBudgetInput').dispatch_event('input')
        page.locator('#toggleScorePanelBtn').click()
        page.locator('#tableWrapper').evaluate('(el) => {el.scrollTop = 0}')
        take('05-modo-oscuro-1280x800.png', 'Tu presupuesto. Tus prioridades.', 'Ajusta el Score, define tu límite de precio y compara también en modo oscuro.')
        browser.close()
    assert not errors, errors
    make_promo((440, 280), raw).save(OUT / 'promo-440x280.png')
    make_promo((1400, 560), raw).save(OUT / 'marquesina-1400x560.png')
    files = captures + ['promo-440x280.png', 'marquesina-1400x560.png']
    for name in files:
        with Image.open(OUT / name) as im:
            assert im.mode == 'RGB', (name, im.mode)
            expected = (1280, 800) if name in captures else ((440, 280) if name.startswith('promo') else (1400, 560))
            assert im.size == expected, (name, im.size)
            assert (OUT / name).read_bytes()[24:26] == bytes([8, 2]), 'PNG debe ser RGB de 24 bits'
    (OUT / 'LEEME.txt').write_text(
        'IMÁGENES PARA CHROME WEB STORE\n\n'
        'Capturas: 01 a 05, en ese orden (1280 x 800). Máximo: cinco.\n'
        'Imagen promocional pequeña: promo-440x280.png\n'
        'Marquesina opcional: marquesina-1400x560.png\n\n'
        'Todos los PNG son RGB de 24 bits, sin canal alfa.\n'
        'Las capturas muestran la interfaz real del proyecto con productos, precios y valoraciones ficticios, identificados como datos de ejemplo.\n'
        'No son precios actuales ni una verificación del funcionamiento con Amazon o proveedores de IA.\n'
        'Los enlaces compartibles requieren cuenta; no se creó ni publicó ningún enlace.\n'
        'No se ha subido contenido a Chrome Web Store.\n', encoding='utf-8')
    archive = ROOT / 'store' / 'imagenes-chrome-web-store.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
        for name in files + ['LEEME.txt']:
            z.write(OUT / name, name)
    print(f'OK: {len(files)} PNG RGB validados. ZIP: {archive}')


if __name__ == '__main__':
    main()
