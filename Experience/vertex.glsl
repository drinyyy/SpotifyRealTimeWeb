attribute float bladeCurve;
attribute float instanceDensity;
varying vec2 vUv;
varying float vHeight;
varying float vAo;

uniform float time;
uniform float windSpeed;
uniform float windStrength;
uniform vec2 windDirection;
uniform sampler2D noiseTexture;

void main() {
    vUv = uv;
    vHeight = position.y;

    // Get the instance position from the transformation matrix
    vec3 instancePosition = instanceMatrix[3].xyz;

    // Calculate UV coordinates for noise sampling
    vec2 noiseUV = (instancePosition.xz + windDirection * time * windSpeed) * 0.05;
    
    // Sample the noise texture
    vec4 noiseValue = texture2D(noiseTexture, noiseUV);
    
    // Create a more dynamic wind effect
    float windNoise = (noiseValue.r * 2.0 - 1.0) * windStrength;
windNoise *= smoothstep(0.0, 0.5, vHeight);

    float maxDisplacement = 0.2; // Adjust this value as needed
windNoise = clamp(windNoise, -maxDisplacement, maxDisplacement);
    // Add some variation based on instance position
    float variationFactor = sin(instancePosition.x * 0.1 + instancePosition.z * 0.1 + time * 0.5) * 0.2 + 0.8;
    windNoise *= variationFactor;

    // Calculate the bend angle
    float bendAngle = bladeCurve * vHeight * 1.5 + windNoise;

    // Create a rotation matrix for bending
    mat3 bendRotationMatrix = mat3(
        cos(bendAngle), -sin(bendAngle), 0.0,
        sin(bendAngle), cos(bendAngle), 0.0,
        0.0, 0.0, 1.0
    );

    // Apply the bend rotation
    vec3 bentPosition = bendRotationMatrix * position;

    // Add some fine, rapid oscillation
    float rapidOscillation = sin(time * 5.0 + instancePosition.x * 0.5 + instancePosition.z * 0.5) * 0.01 * vHeight;
    bentPosition.xz += vec2(rapidOscillation) * windDirection;

    // Transform the final position
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(bentPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Pass the ambient occlusion factor to the fragment shader
    vAo = instanceDensity;
}