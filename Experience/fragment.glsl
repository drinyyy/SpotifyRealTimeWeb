varying vec2 vUv;
varying float vHeight;
varying float vAo; // New varying for ambient occlusion

void main() {
    // Use vHeight to create a gradient effect
    vec3 grassColor = mix(vec3(0.18, 0.294, 0.212), vec3(1.0, 0.867, 0.541), vHeight);

    // Apply ambient occlusion to the grass color
    float ao = mix(1.0, 0.5, vAo); // 1.0 means no occlusion, 0.5 means full occlusion
    grassColor *= ao;

    // Specular effect, shinier at the top of the blade
    float specularIntensity = mix(0.01, 1.0, vHeight); // More shiny at the top
    vec3 specularColor = vec3(1.0) * specularIntensity;

    // Final color with specular applied
    vec3 finalColor = grassColor + specularColor * 0.7;

    gl_FragColor = vec4(finalColor, 1.0);
}
