export function horizontalMovement(camera, cube, clock, keys) {
  camera.getWorldDirection(vec)
  vec.y = 0
  vec.normalize()
  const delta = clock.getDelta()
  const distance = moveSpeed * delta
  if (keys.forwards) {
    cube.position.z += vec.z * distance
    cube.position.x += vec.x * distance
  }
  if (keys.left) {
    cube.position.z += vec.x * -distance
    cube.position.x += vec.z * distance
  }
  if (keys.backward) {
    cube.position.z += vec.z * -distance
    cube.position.x += vec.x * -distance
  }
  if (keys.right) {
    cube.position.z += vec.x * distance
    cube.position.x += vec.z * -distance
  }
   if (keys.jump) {
    cube.position.y += distance * 100
    keys.jump = false
    keys.falling = true
  } if (keys.falling) {
    if (cube.position.y >= -3) {
      cube.position.y -= 0.05
    } else {
      keys.falling = false
    }
  }
}


