package cn.czgrzx.ba

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    WindowCompat.setDecorFitsSystemWindows(window,false)
    val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)

    // 3. 隐藏状态栏和导航栏
    windowInsetsController.apply {
      // 隐藏系统栏（包含状态栏和导航栏）[reference:3]
      hide(WindowInsetsCompat.Type.systemBars())
      // 设置为“轻扫显示”模式，让用户从边缘滑动即可呼出系统栏
      systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }

    // 4. 将状态栏颜色设为透明（作为备用方案）[reference:5]
    window.statusBarColor = android.graphics.Color.TRANSPARENT
  }
}
