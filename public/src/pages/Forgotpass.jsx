import React from 'react'
// import { host } from '../utils/APIRoutes'
import axios from 'axios'

function Forgotpass() {
    axios.post()
  return (
      <div>
          <div className="main">
              <h1>Forgot Password</h1>
              <form>
                  <input type="email" placeholder="Email" required />
                  <button type="submit">Send OTP</button>
              </form>
              
          </div>
    </div>
  )
}

export default Forgotpass