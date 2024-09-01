attribute float bladeCurve;
attribute float instanceDensity;

varying vec2 vUv;
varying float vHeight;
varying float vAo;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vTangent;   // New varying for tangent
varying vec3 vLightDir;  // Varying for light direction
varying vec3 vViewDir;   // Varying for view direction

uniform float time;
uniform float windSpeed;
uniform float windStrength;
uniform vec2 windDirection;
uniform sampler2D noiseTexture;
varying vec3 vOriginalPosition;
uniform vec3 lightPosition;  // Uniform for light position in world space
uniform vec3 viewPosition;   // Uniform for view position in world space

void main() {
    vUv = uv;
    vHeight = position.y;
    vOriginalPosition = position;

    // Instance position from instance matrix
    vec3 instancePosition = instanceMatrix[3].xyz;

    // Compute wind noise based on noise texture
    vec2 noiseUV = (instancePosition.xz + windDirection * time * windSpeed) * 0.05;
    vec4 noiseValue = texture2D(noiseTexture, noiseUV);
    float windNoise = (noiseValue.r * 2.0 - 1.0) * windStrength;
    windNoise *= smoothstep(0.0, 0.5, vHeight);

    // Clamp the wind effect
    float maxDisplacement = 0.2;
    windNoise = clamp(windNoise, -maxDisplacement, maxDisplacement);

    // Variation for more natural movement
    float variationFactor = sin(instancePosition.x * 0.1 + instancePosition.z * 0.1 + time * 0.5) * 0.2 + 0.8;
    windNoise *= variationFactor;

    // Compute bend angle based on blade curvature and wind effect
    float bendAngle = bladeCurve * vHeight * 1.5 + windNoise;

    // Create a bending rotation matrix for the grass blade
    mat3 bendRotationMatrix = mat3(
        cos(bendAngle), -sin(bendAngle), 0.0,
        sin(bendAngle), cos(bendAngle), 0.0,
        0.0, 0.0, 1.0
    );

    // Apply bending to the grass position
    vec3 bentPosition = bendRotationMatrix * position;

    // Additional small oscillation for realism
    float rapidOscillation = sin(time * 5.0 + instancePosition.x * 0.5 + instancePosition.z * 0.5) * 0.01 * vHeight;
    bentPosition.xz += vec2(rapidOscillation) * windDirection;

    // Compute the normal for the bent blade
    vNormal = normalize(normalMatrix * bendRotationMatrix * normal);

    // Compute tangent for lighting
    vec3 baseT = vec3(0.0, 1.0, 0.0);  // Assuming Y is the growth direction
    vTangent = normalize(normalMatrix * bendRotationMatrix * baseT);

    // Calculate the Model-View position
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(bentPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vPosition = mvPosition.xyz;
    vAo = instanceDensity;

    // Correct world position with instancing
    vWorldPosition = (modelMatrix * instanceMatrix * vec4(bentPosition, 1.0)).xyz;

    // Compute light direction in view space
    vec3 lightPosView = (modelViewMatrix * vec4(lightPosition, 1.0)).xyz;
    vLightDir = normalize(lightPosView - mvPosition.xyz);

    // Compute view direction in view space
    vec3 viewPosView = (modelViewMatrix * vec4(viewPosition, 1.0)).xyz;
    vViewDir = normalize(viewPosView - mvPosition.xyz);
}
