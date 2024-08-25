uniform vec3 grassColorLow;   // Uniform for the low color (0.0 to 0.3)
uniform vec3 grassColorMid;   // Uniform for the mid color (0.3 to 0.7)
uniform vec3 grassColorHigh;  // Uniform for the high color (0.7 to 1.0)

varying vec2 vUv;
varying float vHeight;
varying float vAo; // Varying for ambient occlusion

void main() {
    // Ensure vHeight is clamped between 0 and 1
    float clampedHeight = clamp(vHeight, 0.0, 1.0);

    // Determine which color range we're in and interpolate accordingly
    vec3 grassColor;
    if (clampedHeight < 0.3) {
        grassColor = mix(grassColorLow, grassColorMid, clampedHeight / 0.3);
    } else if (clampedHeight < 0.7) {
        grassColor = mix(grassColorMid, grassColorHigh, (clampedHeight - 0.3) / 0.4);
    } else {
        grassColor = grassColorHigh;
    }

    // Apply ambient occlusion to the grass color
    float ao = mix(1.0, 0.95, vAo); // Reduced AO influence for testing
    grassColor *= ao;

    // Specular effect, shinier at the top of the blade
    float specularIntensity = mix(0.05, 0.5, clampedHeight); // Reduced specular for testing
    vec3 specularColor = vec3(1.0) * specularIntensity;

    // Final color with specular applied
    vec3 finalColor = grassColor + specularColor * 0.5; // Reduced specular impact

    gl_FragColor = vec4(finalColor, 1.0);
}