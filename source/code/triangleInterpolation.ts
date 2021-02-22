import { Controls } from './uiHelper';
import format from 'xml-formatter';

window.addEventListener('load', () => {
    console.log('triangleInterpolation.ts');

    let color1 = '#ff0000';
    let color2 = '#00ff00';
    let color3 = '#0000ff';

    const svgCodeContainer = document.getElementById('svg-code');
    const svgPreviewContainer = document.getElementById('svg-preview');
    const controlsContainer = document.getElementById('svg-controls');
    const controls = new Controls(controlsContainer);

    const colorInput1 = controls.createColorInput(
        'Color 1'
    );
    colorInput1.value = color1;
    colorInput1.addEventListener('input', (event: InputEvent) => {
        color1 = (event.target as HTMLInputElement).value;
        generateAndSetSVG(svgCodeContainer, svgPreviewContainer, color1, color2, color3);
    });

    const colorInput2 = controls.createColorInput(
        'Color 2'
    );
    colorInput2.value = color2;
    colorInput2.addEventListener('input', (event: InputEvent) => {
        color2 = (event.target as HTMLInputElement).value;
        generateAndSetSVG(svgCodeContainer, svgPreviewContainer, color1, color2, color3);
    });

    const colorInput3 = controls.createColorInput(
        'Color 3'
    );
    colorInput3.value = color3;
    colorInput3.addEventListener('input', (event: InputEvent) => {
        color3 = (event.target as HTMLInputElement).value;
        generateAndSetSVG(svgCodeContainer, svgPreviewContainer, color1, color2, color3);
    });

    generateAndSetSVG(svgCodeContainer, svgPreviewContainer, color1, color2, color3);
})

const generateAndSetSVG = (
    svgCodeContainer: HTMLElement,
    svgPreviewContainer: HTMLElement,
    color1: string,
    color2: string,
    color3: string
) => {
    const svg = generateSVG(color1, color2, color3);    
    svgCodeContainer.innerText = format(svg);
    svgPreviewContainer.innerHTML = svg;
}

const generateSVG = (
    color1: string,
    color2: string,
    color3: string
    ) => {
    console.log('generateSVG()');
    return generateBlurSVG(color1, color2, color3);
}

const generateBlurSVG = (
    color1: string,
    color2: string,
    color3: string
    ) => {
    console.log('generateBlurSVG()');
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
            <use href="#segment" fill="${color1}"/>
            <use href="#segment" fill="${color2}" transform="rotate(120 0.5 0.289)"/>
            <use href="#segment" fill="${color3}" transform="rotate(240 0.5 0.289)"/>
        </g>
    `;

    const triangle = `
        <g id="colorTri" clip-path="url(#clipTri)" transform="scale(100)">
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