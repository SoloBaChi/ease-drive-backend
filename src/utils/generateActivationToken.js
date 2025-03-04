
import crypto from "crypto"


export const generateActivationToken = async() =>  {
  return crypto.randomBytes(20).toString("hex");
}


