import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FAQItem } from '../../types';
import { Plus, Edit2, Trash2, X, HelpCircle } from 'lucide-react';

export const FaqManager: React.FC = () => {
  const { faqs, addFaq, updateFaq, deleteFaq, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState<'courses' | 'orders' | 'certificates' | 'payments'>('courses');

  const openAddModal = () => {
    setEditingFaq(null);
    setQuestion('');
    setAnswer('');
    setCategory('courses');
    setIsModalOpen(true);
  };

  const openEditModal = (f: FAQItem) => {
    setEditingFaq(f);
    setQuestion(f.question);
    setAnswer(f.answer);
    setCategory(f.category);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      showToast('لطفاً عنوان سوال و پاسخ آن را وارد فرمایید.', 'error');
      return;
    }

    if (editingFaq) {
      updateFaq(editingFaq.id, {
        question: question.trim(),
        answer: answer.trim(),
        category,
      });
    } else {
      addFaq({
        question: question.trim(),
        answer: answer.trim(),
        category,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">مدیریت پرسش‌ها و پاسخ‌های متداول (FAQ)</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            پاسخ به سوالات هنرجویان و مشتریان برای ارجاع سریع از تلفن یا اینستاگرام به سایت
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن پرسش و پاسخ جدید</span>
        </button>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-stone-900">{faq.question}</span>
                <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium">
                  {faq.category === 'courses'
                    ? 'دوره‌ها'
                    : faq.category === 'orders'
                    ? 'سفارشات'
                    : faq.category === 'certificates'
                    ? 'مدارک'
                    : 'مالی'}
                </span>
              </div>
              <p className="text-stone-600 leading-relaxed max-w-3xl">
                {faq.answer}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openEditModal(faq)}
                className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-amber-900"
                title="ویرایش"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm('آیا از حذف این پرسش متداول اطمینان دارید؟')) {
                    deleteFaq(faq.id);
                  }
                }}
                className="p-2 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                title="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <h3 className="font-bold text-stone-900 text-sm">
                {editingFaq ? 'ویرایش پرسش متداول' : 'افزودن پرسش جدید'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  دسته‌بندی سوال
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs"
                >
                  <option value="courses">دوره‌ها و کلاس‌ها</option>
                  <option value="certificates">مدارک و گواهینامه‌ها</option>
                  <option value="orders">سفارش کیک و دسر</option>
                  <option value="payments">پرداخت و شهریه اقساطی</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  متن پرسش هنرجو یا مشتری <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="مثال: نحوه پرداخت شهریه دوره‌ها چگونه است؟"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  پاسخ کامل و حرفه‌ای <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="پاسخ دقیق و راهنمای کامل را بنویسید..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl"
                >
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
