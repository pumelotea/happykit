// eslint-disable-next-line no-unused-vars
import { $get, $post, $put, $delete } from '@/apis/index'

const apiDefinition = {
  login(username: string, password: string) {
    return $post('/login', { username, password })
  }
}
export default apiDefinition
