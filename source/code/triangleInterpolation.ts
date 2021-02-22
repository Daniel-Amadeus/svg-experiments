import { Controls } from './uiHelper';
import format from 'xml-formatter';

window.addEventListener('load', () => {
    console.log('triangleInterpolation.ts');

    let colors = ['#ff0000', '#00ff00', '#0000ff'];
    let points = [[50, 50], [250, 0], [200, 100]];

    const svgCodeContainer = document.getElementById('svg-code');
    const svgPreviewContainer = document.getElementById('svg-preview');
    const controlsContainer = document.getElementById('svg-controls');
    const controls = new Controls(controlsContainer);

    const colorInput1 = controls.createColorInput(
        'Color 1'
    );
    colorInput1.value = colors[0];
    colorInput1.addEventListener('input', (event: InputEvent) => {
        colors[0] = (event.target as HTMLInputElement).value;
        generateAndSetSVG(svgCodeContainer, svgPreviewContainer, colors, points);
    });

    const colorInput2 = controls.createColorInput(
        'Color 2'
    );
    colorInput2.value = colors[1];
    colorInput2.addEventListener('input', (event: InputEvent) => {
        colors[1] = (event.target as HTMLInputElement).value;
        generateAndSetSVG(svgCodeContainer, svgPreviewContainer, colors, points);
    });

    const colorInput3 = controls.createColorInput(
        'Color 3'
    );
    colorInput3.value = colors[2];
    colorInput3.addEventListener('input', (event: InputEvent) => {
        colors[2] = (event.target as HTMLInputElement).value;
        generateAndSetSVG(svgCodeContainer, svgPreviewContainer, colors, points);
    });

    generateAndSetSVG(svgCodeContainer, svgPreviewContainer, colors, points);
})

const generateAndSetSVG = (
    svgCodeContainer: HTMLElement,
    svgPreviewContainer: HTMLElement,
    colors: string[],
    points: number[][]
) => {
    const svg = generateSVG(colors, points);    
    svgCodeContainer.innerText = format(svg);
    svgPreviewContainer.innerHTML = svg;
}

const generateSVG = (
    colors: string[],
    points: number[][]
    ) => {
    console.log('generateSVG()');
    return generateBlurSVG(colors, points);
}

const generateBlurSVG = (
    colors: string[],
    points: number[][]
    ) => {
    console.log('generateBlurSVG()');

    const m = points[0][0];
    const n = points[0][1];
    const o = points[1][0];
    const p = points[1][1];
    const q = points[2][0];
    const r = points[2][1];

    let a = o - m;
    let b = p - n;
    let c = -(m+o-2*q)/Math.sqrt(3);
    let d = -(n+p-2*r)/Math.sqrt(3);
    let e = m;
    let f = n;

    let transform = 'matrix(' + a + ' ' + b + ' ' + c + ' ' + d + ' ' + e + ' ' + f + ')';

    const defs = `
        <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.05" />
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
<svg xmlns="http://www.w3.org/2000/svg" width="610" height="510">
<defs>
${defs}
</defs>
${triangle}
</svg>`;

    return svg;
}