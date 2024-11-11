package com.example.yakjo

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.widget.EditText
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class EnterSmsKodeActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_enter_sms_kode)
        val code1 = findViewById<EditText>(R.id.code1)
        val code2 = findViewById<EditText>(R.id.code2)
        val code3 = findViewById<EditText>(R.id.code3)
        val code4 = findViewById<EditText>(R.id.code4)
        val code5 = findViewById<EditText>(R.id.code5)
        val code6 = findViewById<EditText>(R.id.code6)

        val codeInputs = listOf(code1, code2, code3, code4,code5,code6)
        setupCodeInput(codeInputs)
    }
    private fun setupCodeInput(editTexts: List<EditText>) {
        for (i in editTexts.indices) {
            editTexts[i].addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
                override fun afterTextChanged(s: Editable?) {
                    if (s?.length == 1 && i < editTexts.size - 1) {
                        editTexts[i + 1].requestFocus()
                    } else if (s.isNullOrEmpty() && i > 0) {
                        editTexts[i - 1].requestFocus()
                    }
                }
            })
        }
    }
}