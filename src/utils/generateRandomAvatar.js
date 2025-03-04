//importing the avatar data
import { avatarStyles } from "./avatar.data.js"


const getRandomAvatarStyle = () => {
  // Your code here
  let avatar
  for (let i = 0; i < avatarStyles.length; i++) {
    const randomNum = Math.floor(Math.random() * avatarStyles.length) + 1
    avatar = avatarStyles[randomNum]
  }

  return avatar
}

export const generateRandomAvatar = async (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const _email = email.replaceAll(' ', '')

  const isValidEmail = emailRegex.test(_email)

  if (!isValidEmail) {
    throw new Error('Invalid email')
  }

  const entropySource = () => Math.random().toString(36).substring(2, 7)

  const replaceAt = `-${entropySource()}-`

  const replaceDot = `-${entropySource()}-`

  const seed = _email.replace('@', replaceAt).replaceAll('.', replaceDot)

  const randomAvatarStyle = getRandomAvatarStyle()

  if (!randomAvatarStyle || !avatarStyles.includes(randomAvatarStyle)) {
    // console.error('Invalid avatar style') // log this error to the console

    throw new Error('Something failed: ')
  }

  const avatarUrl = `https://api.dicebear.com/5.x/${randomAvatarStyle}/svg?seed=${seed}&size=200&radius=50`

  return avatarUrl
}
