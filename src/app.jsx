import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, ArrowLeft, Check, CheckCheck, Smile } from 'lucide-react';

const WhatsAppSurveyApp = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const chatEndRef = useRef(null);

  const questions = [
    {
      id: 'intro',
      text: 'שלום! ברוכים הבאים לשאלון על ניהול כספים וקבלות 💰\nהשאלון יעזור לנו להבין את הצרכים שלך. בואו נתחיל?',
      type: 'intro',
      options: ['בואו נתחיל! 🚀']
    },
    // פרטים אישיים ואפיון תעסוקתי
    {
      id: 'employment_type',
      text: 'מה אתה עושה בעבודה?',
      type: 'multiple',
      section: 'פרטים אישיים ואפיון תעסוקתי',
      options: ['שכיר', 'עצמאי / פרילנסר', 'בעל עסק קטן', 'בעל עסק בינוני', 'גם שכיר וגם עצמאי', 'אחר']
    },
    {
      id: 'work_field',
      text: 'תחום העיסוק שלך?',
      type: 'text',
      section: 'פרטים אישיים ואפיון תעסוקתי',
      placeholder: 'כתוב את תחום העיסוק שלך...'
    },
    {
      id: 'years_in_field',
      text: 'כמה שנים אתה בתחום?',
      type: 'multiple',
      section: 'פרטים אישיים ואפיון תעסוקתי',
      options: ['פחות משנה', '1–3 שנים', '3–7 שנים', 'יותר מ־7 שנים']
    },
    {
      id: 'team_size',
      text: 'כמה אנשים עובדים איתך?',
      type: 'multiple',
      section: 'פרטים אישיים ואפיון תעסוקתי',
      options: ['אני לבד', 'עם שותף/ה', '1–5 עובדים', 'יותר מ־6 עובדים']
    },
    // ניהול כספים אישי ועסקי
    {
      id: 'personal_finance_management',
      text: 'איך אתה מנהל את הכספים האישיים שלך?',
      type: 'multiple',
      section: 'ניהול כספים אישי ועסקי',
      options: ['דיגיטלי', 'ניירת', 'גם וגם']
    },
    {
      id: 'digital_tool',
      text: 'אם זה דיגיטלי – איזה כלי אתה משתמש בו?',
      type: 'text',
      section: 'ניהול כספים אישי ועסקי',
      placeholder: 'שם הכלי הדיגיטלי...',
      condition: (answers) => answers.personal_finance_management === 'דיגיטלי' || answers.personal_finance_management === 'גם וגם'
    },
    {
      id: 'receipt_storage',
      text: 'איפה אתה שומר קבלות היום?',
      type: 'multiple',
      section: 'ניהול כספים אישי ועסקי',
      options: ['תיקיה/ארנק/מגירה (פיזי)', 'תמונות בטלפון / אימייל / וואטסאפ / דרייב', 'בכלל לא שומר']
    },
    {
      id: 'receipt_search_frequency',
      text: 'כמה פעמים בחודש אתה צריך למצוא קבלה?',
      type: 'multiple',
      section: 'ניהול כספים אישי ועסקי',
      options: ['אף פעם', 'אחת לשנה', 'כל כמה חודשים', 'בחודש האחרון', 'בשבוע האחרון', 'אחר']
    },
    {
      id: 'receipt_search_experience',
      text: 'כשכבר היית צריך למצוא קבלה – מה זכור לך מהחוויה הזו?',
      type: 'multiple',
      section: 'ניהול כספים אישי ועסקי',
      options: ['לא זוכר', 'קצת מעצבן, מבאס – הייתי חייב למצוא את זה']
    },
    {
      id: 'most_annoying_thing',
      text: 'מה הכי מעצבן בתהליך הזה?',
      type: 'paragraph',
      section: 'ניהול כספים אישי ועסקי',
      placeholder: 'תאר מה הכי מעצבן אותך בחיפוש קבלות...'
    },
    {
      id: 'lost_money_time',
      text: 'האם אי פעם איבדת כסף או זמן בגלל קבלה שלא מצאת?',
      type: 'multiple',
      section: 'ניהול כספים אישי ועסקי',
      options: ['כן', 'לא', 'לא בטוח']
    },
    {
      id: 'why_need_receipts',
      text: 'למה אתה צריך קבלות? (ניתן לבחור מספר אפשרויות)',
      type: 'checkbox',
      section: 'ניהול כספים אישי ועסקי',
      options: ['החזר ממעביד', 'דיווח למס', 'אחריות על מוצרים', 'תקציב אישי', 'הוצאות עסקיות', 'אחר']
    },
    // עצמאים ופרילנסרים (יופיעו רק לעצמאים)
    {
      id: 'business_expenses_management',
      text: 'איך אתה מנהל הוצאות עסקיות?',
      type: 'paragraph',
      section: 'עצמאים ופרילנסרים',
      placeholder: 'תאר איך אתה מנהל הוצאות עסקיות...',
      condition: (answers) => answers.employment_type?.includes('עצמאי') || answers.employment_type?.includes('עסק')
    },
    {
      id: 'accountant_help',
      text: 'האם אתה נעזר ברואה חשבון?',
      type: 'multiple',
      section: 'עצמאים ופרילנסרים',
      options: ['כן – בתשלום קבוע', 'כן – לפי צורך', 'לא – עושה הכול לבד'],
      condition: (answers) => answers.employment_type?.includes('עצמאי') || answers.employment_type?.includes('עסק')
    },
    {
      id: 'time_spent_monthly',
      text: 'כמה זמן בחודש אתה משקיע בניהול קבלות וחשבוניות?',
      type: 'multiple',
      section: 'עצמאים ופרילנסרים',
      options: ['פחות מ־10 דקות', '10–30 דקות', '30–60 דקות', 'יותר משעה'],
      condition: (answers) => answers.employment_type?.includes('עצמאי') || answers.employment_type?.includes('עסק')
    },
    {
      id: 'tried_receipt_app',
      text: 'האם ניסית אפליקציה לניהול קבלות?',
      type: 'multiple',
      section: 'עצמאים ופרילנסרים',
      options: ['כן', 'לא'],
      condition: (answers) => answers.employment_type?.includes('עצמאי') || answers.employment_type?.includes('עסק')
    },
    {
      id: 'which_app',
      text: 'אם כן – איזו אפליקציה?',
      type: 'text',
      section: 'עצמאים ופרילנסרים',
      placeholder: 'שם האפליקציה...',
      condition: (answers) => answers.tried_receipt_app === 'כן'
    },
    {
      id: 'missing_in_solutions',
      text: 'מה חסר לך בפתרונות הקיימים?',
      type: 'paragraph',
      section: 'עצמאים ופרילנסרים',
      placeholder: 'תאר מה חסר בפתרונות הנוכחיים...',
      condition: (answers) => answers.employment_type?.includes('עצמאי') || answers.employment_type?.includes('עסק')
    },
    {
      id: 'perfect_solution',
      text: 'איך נראה בעיניך פתרון מושלם?',
      type: 'paragraph',
      section: 'עצמאים ופרילנסרים',
      placeholder: 'תאר את הפתרון המושלם עבורך...',
      condition: (answers) => answers.employment_type?.includes('עצמאי') || answers.employment_type?.includes('עסק')
    },
    // מוכנות לאימוץ פתרון
    {
      id: 'solution_value',
      text: 'אם היה פתרון שחוסך לך זמן/כסף/כאב ראש – כמה זה היה שווה לך?',
      type: 'multiple',
      section: 'מוכנות לאימוץ פתרון',
      options: ['לא משמעותי', 'נחמד, אבדוק ואז אולי אשלם', 'ברור שאשלם']
    },
    {
      id: 'what_would_make_you_use',
      text: 'מה היה גורם לך באמת להשתמש בפתרון כזה?',
      type: 'paragraph',
      section: 'מוכנות לאימוץ פתרון',
      placeholder: 'מה יגרום לך להשתמש בפתרון...'
    },
    {
      id: 'long_term_adoption',
      text: 'מה צריך לקרות כדי שתאמץ פתרון כזה לאורך זמן?',
      type: 'paragraph',
      section: 'מוכנות לאימוץ פתרון',
      placeholder: 'מה יגרום לך להישאר עם הפתרון לאורך זמן...'
    }
  ];

  // פונקציה לשליחת התשובות לגוגל שיטס
  const submitToGoogleSheets = async (surveyAnswers) => {
    setIsSubmitting(true);
    
    // יש להחליף את ה-URL הזה ב-URL של Google Apps Script שלך
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxRqn4zmyEmieRWdweihOKbfrF4s9NfmVoXVrlPtSj1UngoVjAjQ6AOB2-PPD_jMvGF/exec';
    
    try {
      // הכנת הנתונים לשליחה
      const submissionData = {
        timestamp: new Date().toLocaleString('he-IL'),
        ...surveyAnswers
      };

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        return true;
      } else {
        setSubmitStatus('error');
        return false;
      }
    } catch (error) {
      console.error('Error submitting to Google Sheets:', error);
      setSubmitStatus('error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  useEffect(() => {
    // הצגת ההודעה הראשונה
    if (chatHistory.length === 0) {
      setTimeout(() => {
        addBotMessage(questions[0].text, questions[0]);
      }, 1000);
    }
  }, []);

  const addBotMessage = (text, question) => {
    setIsTyping(true);
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: text,
        time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        question: question
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const addUserMessage = (text) => {
    setChatHistory(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      delivered: true
    }]);
  };

  const getNextQuestion = () => {
    for (let i = currentQuestion + 1; i < questions.length; i++) {
      const question = questions[i];
      if (!question.condition || question.condition(answers)) {
        return i;
      }
    }
    return -1; // אין שאלות נוספות
  };

  const handleAnswer = async (answer, questionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    addUserMessage(answer);

    setTimeout(async () => {
      const nextQuestionIndex = getNextQuestion();
      if (nextQuestionIndex !== -1) {
        setCurrentQuestion(nextQuestionIndex);
        addBotMessage(questions[nextQuestionIndex].text, questions[nextQuestionIndex]);
      } else {
        // סיום השאלון - שליחה לגוגל שיטס
        const finalAnswers = { ...answers, [questionId]: answer };
        
        addBotMessage('תודה רבה! השאלון הושלם בהצלחה 🎉\nהתשובות נשלחות למערכת...', null);
        
        const success = await submitToGoogleSheets(finalAnswers);
        
        setTimeout(() => {
          if (success) {
            addBotMessage('✅ התשובות נשלחו בהצלחה!\nתודה על השתתפותך בשאלון. התשובות שלך יעזרו לנו לפתח פתרון טוב יותר לניהול קבלות וכספים.', null);
          } else {
            addBotMessage('⚠️ הייתה בעיה בשליחת התשובות.\nאבל אל תדאג - התשובות נשמרו מקומית. תוכל לנסות שוב או ליצור קשר איתנו.', null);
            
            // הצגת התשובות למשתמש כגיבוי
            const answersText = Object.entries(finalAnswers)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n');
            
            setTimeout(() => {
              addBotMessage(`📋 התשובות שלך:\n${answersText}`, null);
            }, 2000);
          }
        }, 2000);
      }
    }, 1000);
  };

  const handleTextSubmit = (text, questionId) => {
    if (text.trim()) {
      handleAnswer(text, questionId);
    }
  };

  const QuestionComponent = ({ question, onAnswer }) => {
    const [textInput, setTextInput] = useState('');
    const [selectedOptions, setSelectedOptions] = useState([]);

    if (!question) return null;

    if (question.type === 'intro' || question.type === 'multiple' || question.type === 'rating') {
      return (
        <div className="flex flex-col gap-2 mt-2">
          {question.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswer(option, question.id)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 text-right"
            >
              {option}
            </button>
          ))}
        </div>
      );
    }

    if (question.type === 'checkbox') {
      const handleCheckboxChange = (option) => {
        const newSelected = selectedOptions.includes(option)
          ? selectedOptions.filter(item => item !== option)
          : [...selectedOptions, option];
        setSelectedOptions(newSelected);
      };

      return (
        <div className="mt-2">
          <div className="flex flex-col gap-2 mb-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                  className="rounded"
                />
                <span className="text-right">{option}</span>
              </label>
            ))}
          </div>
          <button
            onClick={() => {
              if (selectedOptions.length > 0) {
                onAnswer(selectedOptions.join(', '), question.id);
                setSelectedOptions([]);
              }
            }}
            disabled={selectedOptions.length === 0}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 w-full"
          >
            שלח תשובה ({selectedOptions.length} נבחרו)
          </button>
        </div>
      );
    }

    if (question.type === 'text') {
      return (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={question.placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleTextSubmit(textInput, question.id);
                setTextInput('');
              }
            }}
            dir="rtl"
          />
          <button
            onClick={() => {
              handleTextSubmit(textInput, question.id);
              setTextInput('');
            }}
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors duration-200"
          >
            <Send size={16} />
          </button>
        </div>
      );
    }

    if (question.type === 'paragraph') {
      return (
        <div className="mt-2">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right resize-none"
            rows={3}
            dir="rtl"
          />
          <button
            onClick={() => {
              if (textInput.trim()) {
                onAnswer(textInput, question.id);
                setTextInput('');
              }
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 w-full mt-2"
          >
            שלח תשובה
          </button>
        </div>
      );
    }

    return null;
  };

  const lastMessage = chatHistory[chatHistory.length - 1];
  const showQuestionComponent = lastMessage?.sender === 'bot' && lastMessage?.question;

  return (
    <div className="h-screen bg-gray-100 flex flex-col max-w-sm mx-auto">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 flex items-center gap-3 shadow-lg">
        <ArrowLeft size={20} className="cursor-pointer" />
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-green-600 font-bold text-lg">📋</span>
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-lg">שאלון המשתמש</h1>
          <p className="text-green-100 text-sm">מקוון</p>
        </div>
        <div className="flex gap-4">
          <Video size={20} className="cursor-pointer" />
          <Phone size={20} className="cursor-pointer" />
          <MoreVertical size={20} className="cursor-pointer" />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" 
           style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}>
        
        {chatHistory.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.sender === 'user' 
                ? 'bg-white text-black border' 
                : 'bg-green-500 text-white'
            } shadow-sm`}>
              {message.question?.section && message.sender === 'bot' && (
                <div className="text-xs opacity-75 mb-1 text-green-100">
                  {message.question.section}
                </div>
              )}
              <p className="text-sm whitespace-pre-line text-right" dir="rtl">{message.text}</p>
              <div className={`flex items-center justify-start gap-1 mt-1 ${
                message.sender === 'user' ? 'text-gray-500' : 'text-green-100'
              }`}>
                <span className="text-xs">{message.time}</span>
                {message.sender === 'user' && (
                  <CheckCheck size={14} className="text-blue-500" />
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {(isTyping || isSubmitting) && (
          <div className="flex justify-end">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-sm">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">שולח תשובות...</span>
                </div>
              ) : (
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Question Component */}
        {showQuestionComponent && !isTyping && !isSubmitting && (
          <div className="flex justify-end">
            <div className="max-w-xs lg:max-w-md">
              <QuestionComponent 
                question={lastMessage.question} 
                onAnswer={handleAnswer}
              />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-2 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>התקדמות השאלון</span>
          <span>{Math.round((currentQuestion / (questions.length - 1)) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentQuestion / (questions.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSurveyApp;