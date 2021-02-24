import { Controls } from './uiHelper';
import format from 'xml-formatter';

const hljs = require('highlight.js');
const md = require('markdown-it')({
    highlight: function (str: string, lang: string) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (__) { }
        }

        return ''; // use external default escaping
    }
});

window.addEventListener('load', () => {

    let mouseDown = false;
    let selectedPoint = -1;

    let colors = ['#ff0000', '#00ff00', '#0000ff'];
    let points = [[50, 50], [250, 0], [200, 100]];
    let selectedGenerator = 0;
    const generators = [
        {
            name: 'Blur',
            function: generateBlurSVG
        },
        {
            name: 'Gamma',
            function: generateGammaSVG
        }
    ];

    const svgCodeContainer = document.getElementById('svg-code');
    const svgPreviewContainer = document.getElementById('svg-preview');
    const controlsContainer = document.getElementById('svg-controls');
    const controls = new Controls(controlsContainer);

    const generatorInput = controls.createSelectListInput(
        'Generator',
        generators.map((generator) => { return generator.name })
    );
    generatorInput.selectedIndex = selectedGenerator;
    generatorInput.addEventListener('change', (event) => {
        selectedGenerator = (event.target as HTMLSelectElement).selectedIndex;
        generateAndSetSVG(
            svgCodeContainer,
            svgPreviewContainer,
            generators[selectedGenerator].function,
            colors,
            points
        );
    });

    colors.forEach((color, index) => {
        const colorInput1 = controls.createColorInput(
            'Color ' + (index + 1)
        );
        colorInput1.value = color;
        colorInput1.addEventListener('input', (event: InputEvent) => {
            colors[index] = (event.target as HTMLInputElement).value;
            generateAndSetSVG(
                svgCodeContainer,
                svgPreviewContainer,
                generators[selectedGenerator].function,
                colors,
                points
            );
        });
    });

    svgPreviewContainer.addEventListener('mousedown', (event: MouseEvent) => {
        mouseDown = true;
        let rect = svgPreviewContainer.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        let shortestDistance = Infinity;
        points.forEach((point, index) => {
            const distance = Math.pow(point[0] - offsetX, 2) + Math.pow(point[1] - offsetY, 2);
            if (distance < shortestDistance) {
                selectedPoint = index;
                shortestDistance = distance;
            }
        })
    })

    svgPreviewContainer.addEventListener('mouseup', () => {
        mouseDown = false;
        selectedPoint = -1;
    })

    svgPreviewContainer.addEventListener('mousemove', (event: MouseEvent) => {
        if (selectedPoint < 0) {
            return;
        }

        let rect = svgPreviewContainer.getBoundingClientRect();
        points[selectedPoint][0] = event.clientX - rect.left;
        points[selectedPoint][1] = event.clientY - rect.top;

        generateAndSetSVG(
            svgCodeContainer,
            svgPreviewContainer,
            generators[selectedGenerator].function,
            colors,
            points
        );


    });

    generateAndSetSVG(
        svgCodeContainer,
        svgPreviewContainer,
        generators[selectedGenerator].function,
        colors,
        points
    );
})

const generateAndSetSVG = (
    svgCodeContainer: HTMLElement,
    svgPreviewContainer: HTMLElement,
    generator: (colors: string[], points: number[][]) => string,
    colors: string[],
    points: number[][]
) => {
    const svg = generator(colors, points);
    const formatted = format(svg, { indentation: '  ' });
    const result = md.render('``` xml\n' + formatted + '\n```');
    svgCodeContainer.innerHTML = result;
    svgPreviewContainer.innerHTML = svg;
}

const generateBlurSVG = (
    colors: string[],
    points: number[][]
) => {
    const m = points[0][0];
    const n = points[0][1];
    const o = points[1][0];
    const p = points[1][1];
    const q = points[2][0];
    const r = points[2][1];

    let a = o - m;
    let b = p - n;
    let c = -(m + o - 2 * q) / Math.sqrt(3);
    let d = -(n + p - 2 * r) / Math.sqrt(3);
    let e = m;
    let f = n;

    let transform = 'matrix(' + a + ' ' + b + ' ' + c + ' ' + d + ' ' + e + ' ' + f + ')';

    const defs = `
        <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.2" />
        </filter>
        <path id="triangle" fill="#000" d="M 0 0 h 1 l -0.5 0.866 Z"/>
        <path id="segment" d="M 0.5 0.289 L 0.5 -0.577 L -1 -0.577 L -0.25 0.722 Z" />
        <clipPath id="clipTri">
            <use href="#triangle"/>
        </clipPath>
        <g id="segments">
            <use href="#segment" fill="${colors[0]}"/>
            <use href="#segment" fill="${colors[1]}" transform="rotate(120 0.5 0.289)"/>
            <use href="#segment" fill="${colors[2]}" transform="rotate(240 0.5 0.289)"/>
        </g>
    `;

    const triangle = `
        <g id="colorTri" clip-path="url(#clipTri)" transform="${transform}">
            <g filter="url(#blur)">
                <use href="#segments"/>
            </g>
        </g>
    `;

    let svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
                ${defs}
            </defs>
            ${triangle}
        </svg>`;

    return svg;
}

const generateGradient = (
    colors: string[],
    points: number[][],
    index: number
): string => {

    const x0 = points[(index + 0) % 3][0];
    const y0 = points[(index + 0) % 3][1];
    const x1 = points[(index + 1) % 3][0];
    const y1 = points[(index + 1) % 3][1];
    const x2 = points[(index + 2) % 3][0];
    const y2 = points[(index + 2) % 3][1];

    const r = (x1 * x1 - x1 * x2 + x0 * (x2 - x1) - (y0 - y1) * (y1 - y2))
        / (x1 * x1 + y1 * y1 - 2 * x1 * x2 + x2 * x2 - 2 * y1 * y2 + y2 * y2);

    let hx0 = x1 * -r + x1 + x2 * r || x1;
    let hy0 = y1 * -r + y1 + y2 * r || y1;

    return `
    <linearGradient id="gradient${index}" gradientUnits="userSpaceOnUse" x1="${x0}" y1="${y0}" x2="${hx0}" y2="${hy0}">
        <stop offset="0" stop-color="${colors[index]}" />
        <stop offset="1" stop-color="#000" />
    </linearGradient>
    `;
}

const generateGammaSVG = (
    colors: string[],
    points: number[][]
) => {
    const x0 = points[0][0];
    const y0 = points[0][1];
    const x1 = points[1][0];
    const y1 = points[1][1];
    const x2 = points[2][0];
    const y2 = points[2][1];

    let defs = `
        <filter id="gamma" x="0" y="0" width="100%" height="100%">
            <feComponentTransfer>
            <feFuncR
                type="gamma" amplitude="1" exponent="0.45454545" offset="0"
            />
            <feFuncG
                type="gamma" amplitude="1" exponent="0.45454545" offset="0"
            />
            <feFuncB
                type="gamma" amplitude="1" exponent="0.45454545" offset="0"
            />
            </feComponentTransfer>
        </filter>
    `;
    for (let i = 0; i < points.length; i++) {
        defs += generateGradient(colors, points, i);
    }

    let triangle = '<g>';
    for (let i = 0; i < points.length; i++) {
        triangle +=
            `<path
                d="M ${x0} ${y0} L ${x1} ${y1} L ${x2} ${y2} Z"
                fill="url(#gradient${i})"
                style="mix-blend-mode:screen;filter:url(#gamma);"
            />`
    }
    triangle += '</g>';

    let svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
                ${defs}
            </defs>
            ${triangle}
        </svg>
    `;

    return svg;
}