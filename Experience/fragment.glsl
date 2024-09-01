uniform vec3 grassColorLow;
uniform vec3 grassColorMid;
uniform vec3 grassColorHigh;
uniform vec3 ambientLightColor;
uniform float ambientLightIntensity;
uniform vec3 pointLightColor;
uniform float pointLightIntensity;
uniform vec3 pointLightPosition;
uniform float pointLightRadius; // New uniform for light falloff control

varying vec2 vUv;
varying float vHeight;
varying float vAo;
varying vec3 vWorldPosition;

void main() {
    // Color interpolation based on height (unchanged)
    float clampedHeight = clamp(vHeight, 0.0, 1.0);
    vec3 grassColor;
    if (clampedHeight < 0.3) {
        grassColor = mix(grassColorLow, grassColorMid, clampedHeight / 0.3);
    } else if (clampedHeight < 0.7) {
        grassColor = mix(grassColorMid, grassColorHigh, (clampedHeight - 0.3) / 0.4);
    } else {
        grassColor = grassColorHigh;
    }

    // Ambient lighting (unchanged)
    vec3 ambient = ambientLightColor * ambientLightIntensity;

    // Point light calculation
    vec3 lightDir = normalize(pointLightPosition - vWorldPosition);
    float distanceToLight = length(pointLightPosition - vWorldPosition);

    // Calculate attenuation with a smooth falloff
    float attenuation = 1.0 - smoothstep(0.0, pointLightRadius, distanceToLight);
    attenuation = pow(attenuation, 2.0); // Square for a more pronounced falloff

    // Calculate diffuse lighting
    float diff = max(dot(lightDir, normalize(vec3(0.0, 1.0, 0.0))), 0.0);
    vec3 diffuse = diff * pointLightColor * pointLightIntensity * attenuation;

    // Apply ambient occlusion
    float ao = mix(1.0, 0.95, vAo);
    grassColor *= ao;

    // Final color with lighting applied
    vec3 finalColor = grassColor * (ambient + diffuse);

    gl_FragColor = vec4(finalColor, 1.0);
}