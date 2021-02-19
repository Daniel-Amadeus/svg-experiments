import { Controls } from './uiHelper';

window.addEventListener('load', () => {
    console.log('triangleInterpolation.ts');

    let color1 = '#ff0000';

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
        generateAndSetSVG(svgCodeContainer, svgPreviewContainer, color1);
    });

    generateAndSetSVG(svgCodeContainer, svgPreviewContainer, color1);
})

const generateAndSetSVG = (
    svgCodeContainer: HTMLElement,
    svgPreviewContainer: HTMLElement,
    color1: string
) => {
    const svg = generateSVG(color1);

    svgCodeContainer.textContent = svg;
    svgPreviewContainer.innerHTML = svg;
}

const generateSVG = (color1: string) => {
    console.log('generateSVG()');
    return generateBlurSVG(color1);
}

const generateBlurSVG = (color1: string) => {
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
            <use href="#segment" fill="#0f0" transform="rotate(120 0.5 0.289)"/>
            <use href="#segment" fill="#00f" transform="rotate(240 0.5 0.289)"/>
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