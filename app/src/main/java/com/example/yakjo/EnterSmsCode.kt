package com.example.yakjo

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity


class EnterSmsCode : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_enter_sms_code)
        setupCodeInput()
        goToNextActivityIfCodeIsNotEmpty()
        val numberPhone = intent.getStringExtra("numberPhone")
        val text = findViewById<TextView>(R.id.textEnterSmsCode)
        text.setText("Мы отправели SMS код для подтвержение на ваш номер +992 ${numberPhone}")
    }


    private fun setupCodeInput() {
        val code1 = findViewById<EditText>(R.id.code1)
        code1.requestFocus()
        val code2 = findViewById<EditText>(R.id.code2)
        val code3 = findViewById<EditText>(R.id.code3)
        val code4 = findViewById<EditText>(R.id.code4)
        val code5 = findViewById<EditText>(R.id.code5)
        val code6 = findViewById<EditText>(R.id.code6)
        val editTexts = listOf(code1, code2, code3, code4, code5, code6)
        for (i in editTexts.indices) {
            editTexts[i].addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(
                    s: CharSequence?,
                    start: Int,
                    count: Int,
                    after: Int
                ) {
                }

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

    private fun goToNextActivityIfCodeIsNotEmpty() {
        val editText1 = findViewById<EditText>(R.id.code1)
        val editText2 = findViewById<EditText>(R.id.code2)
        val editText3 = findViewById<EditText>(R.id.code3)
        val editText4 = findViewById<EditText>(R.id.code4)
        val editText5 = findViewById<EditText>(R.id.code5)
        val editText6 = findViewById<EditText>(R.id.code6)

        val allEditTexts = listOf(editText1, editText2, editText3, editText4, editText5, editText6)

        allEditTexts.forEach { editText ->
            editText.addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(
                    charSequence: CharSequence?,
                    start: Int,
                    before: Int,
                    count: Int
                ) {
                }

                override fun onTextChanged(
                    charSequence: CharSequence?,
                    start: Int,
                    before: Int,
                    count: Int
                ) {
                }

                override fun afterTextChanged(editable: Editable?) {
                    if (allEditTexts.all { it.text.toString().isNotEmpty() }) {
                        val intent = Intent(this@EnterSmsCode, Registration::class.java)
                        startActivity(intent)

                    }
                }
            })
        }

    }
}