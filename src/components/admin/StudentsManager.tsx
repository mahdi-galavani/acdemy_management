import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, PaymentStatus, StudentStatus } from '../../types';
import { Plus, Search, Trash2, Edit2, CheckCircle2, AlertCircle, X, Users, DollarSign, Award } from 'lucide-react';

export const StudentsManager: React.FC = () => {
  const { students, courses, addStudent, updateStudent, deleteStudent, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [tuitionTotal, setTuitionTotal] = useState<number>(0);
  const [tuitionPaid, setTuitionPaid] = useState<number>(0);
  const [certificateIssued, setCertificateIssued] = useState(false);
  const [studentStatus, setStudentStatus] = useState<StudentStatus>('active');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingStudent(null);
    setFullName('');
    setNationalCode('');
    setPhone('');
    setEmail('');
    const defaultCourse = courses[0];
    setSelectedCourseId(defaultCourse?.id || '');
    setTuitionTotal(defaultCourse?.discountPrice || defaultCourse?.price || 0);
    setTuitionPaid(0);
    setPaymentStatus('pending');
    setCertificateIssued(false);
    setStudentStatus('active');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFullName(student.fullName);
    setNationalCode(student.nationalCode);
    setPhone(student.phone);
    setEmail(student.email || '');
    setSelectedCourseId(student.courseId);
    setTuitionTotal(student.tuitionTotal);
    setTuitionPaid(student.tuitionPaid);
    setPaymentStatus(student.paymentStatus);
    setCertificateIssued(student.certificateIssued);
    setStudentStatus(student.status);
    setNotes(student.notes || '');
    setIsModalOpen(true);
  };

  // Sync tuition when course changes during add
  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    if (!editingStudent) {
      const selected = courses.find((c) => c.id === courseId);
      if (selected) {
        setTuitionTotal(selected.discountPrice || selected.price);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !selectedCourseId) {
      showToast('لطفاً نام، شماره تماس و دوره آموزشی را مشخص فرمایید.', 'error');
      return;
    }

    const courseObj = courses.find((c) => c.id === selectedCourseId);
    const courseTitle = courseObj ? courseObj.title : 'دوره آموزشی فندق';

    // Auto calculate payment status if paid amount equals total
    let effectivePaymentStatus = paymentStatus;
    if (tuitionPaid >= tuitionTotal && tuitionTotal > 0) {
      effectivePaymentStatus = 'paid';
    } else if (tuitionPaid > 0 && tuitionPaid < tuitionTotal) {
      effectivePaymentStatus = 'partial';
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        fullName: fullName.trim(),
        nationalCode: nationalCode.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        courseId: selectedCourseId,
        courseTitle,
        paymentStatus: effectivePaymentStatus,
        tuitionTotal: Number(tuitionTotal),
        tuitionPaid: Number(tuitionPaid),
        certificateIssued,
        status: studentStatus,
        notes: notes.trim() || undefined,
      });
    } else {
      addStudent({
        fullName: fullName.trim(),
        nationalCode: nationalCode.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        courseId: selectedCourseId,
        courseTitle,
        paymentStatus: effectivePaymentStatus,
        tuitionTotal: Number(tuitionTotal),
        tuitionPaid: Number(tuitionPaid),
        certificateIssued,
        status: studentStatus,
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery) ||
        s.nationalCode.includes(searchQuery);
      const matchesPayment = paymentFilter === 'all' || s.paymentStatus === paymentFilter;
      const matchesCourse = courseFilter === 'all' || s.courseId === courseFilter;
      return matchesSearch && matchesPayment && matchesCourse;
    });
  }, [students, searchQuery, paymentFilter, courseFilter]);

  const totalTuition = students.reduce((sum, s) => sum + s.tuitionTotal, 0);
  const totalPaid = students.reduce((sum, s) => sum + s.tuitionPaid, 0);
  const totalRemaining = totalTuition - totalPaid;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">مدیریت هنرجویان آموزشگاه فندق</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            ثبت اطلاعات، پیگیری وضعیت شهریه، صدور گواهینامه و سوابق کلاس‌ها
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت هنرجوی جدید</span>
        </button>
      </div>

      {/* Financial & Headcount Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>کل هنرجویان ثبت‌شده:</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <span className="text-xl font-black text-stone-900 tabular-nums">
            {students.length} <span className="text-xs font-normal text-stone-500">نفر</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>مجموع شهریه دریافتی (تسویه):</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-black text-emerald-800 tabular-nums">
            {totalPaid.toLocaleString('fa-IR')} <span className="text-xs font-normal text-stone-500">تومان</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>مانده مطالبات شهریه (اقساط):</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-xl font-black text-amber-900 tabular-nums">
            {totalRemaining.toLocaleString('fa-IR')} <span className="text-xs font-normal text-stone-500">تومان</span>
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام هنرجو، شماره تماس یا کد ملی..."
            className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-800/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Payment filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-none text-stone-700"
          >
            <option value="all">همه وضعیت‌های پرداخت</option>
            <option value="paid">تسویه کامل شده</option>
            <option value="partial">دارای قسط و مانده بدهی</option>
            <option value="pending">در انتظار پرداخت</option>
          </select>

          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-none text-stone-700 max-w-xs truncate"
          >
            <option value="all">همه دوره‌های آموزشی</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold">
              <tr>
                <th className="py-3 px-4">هنرجو</th>
                <th className="py-3 px-4">اطلاعات تماس</th>
                <th className="py-3 px-4">دوره ثبت‌نامی</th>
                <th className="py-3 px-4 text-left">شهریه و وضعیت مالی</th>
                <th className="py-3 px-4 text-center">مدرک</th>
                <th className="py-3 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    هنرجویی با این مشخصات یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const remaining = student.tuitionTotal - student.tuitionPaid;
                  return (
                    <tr key={student.id} className="hover:bg-stone-50/80 transition-colors">
                      
                      {/* Name & ID */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-stone-900 block">{student.fullName}</span>
                        <span className="text-[11px] text-stone-400 block tabular-nums">
                          کد ملی: {student.nationalCode || '---'}
                        </span>
                      </td>

                      {/* Phone & Date */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-stone-800 block tabular-nums">{student.phone}</span>
                        <span className="text-[11px] text-stone-400 block">ثبت‌نام: {student.registrationDate}</span>
                      </td>

                      {/* Course */}
                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-medium text-stone-800 block line-clamp-1">{student.courseTitle}</span>
                        {student.notes && (
                          <span className="text-[11px] text-stone-500 block truncate mt-0.5">
                            یادداشت: {student.notes}
                          </span>
                        )}
                      </td>

                      {/* Financial status */}
                      <td className="py-3 px-4 text-left">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-stone-900 tabular-nums">
                            {student.tuitionPaid.toLocaleString('fa-IR')} / {student.tuitionTotal.toLocaleString('fa-IR')} <span className="text-[10px] text-stone-400">تومان</span>
                          </span>
                          <span
                            className={`text-[10px] font-semibold mt-0.5 ${
                              student.paymentStatus === 'paid'
                                ? 'text-emerald-700'
                                : student.paymentStatus === 'partial'
                                ? 'text-amber-800'
                                : 'text-rose-700'
                            }`}
                          >
                            {student.paymentStatus === 'paid'
                              ? '✓ تسویه کامل'
                              : student.paymentStatus === 'partial'
                              ? `مانده: ${remaining.toLocaleString('fa-IR')} تومان`
                              : 'در انتظار پرداخت'}
                          </span>
                        </div>
                      </td>

                      {/* Certificate */}
                      <td className="py-3 px-4 text-center">
                        {student.certificateIssued ? (
                          <span className="text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>صادر شد</span>
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">صادر نشده</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-amber-900 transition-colors"
                            title="ویرایش"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`آیا از حذف هنرجو «${student.fullName}» اطمینان دارید؟`)) {
                                deleteStudent(student.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <h3 className="font-bold text-stone-900 text-sm">
                {editingStudent ? 'ویرایش پرونده هنرجو' : 'ثبت‌نام هنرجوی جدید در فندق'}
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
                  نام و نام خانوادگی هنرجو <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    شماره همراه <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="۰۹۱۲..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    کد ملی
                  </label>
                  <input
                    type="text"
                    value={nationalCode}
                    onChange={(e) => setNationalCode(e.target.value)}
                    placeholder="۰۰۱۲۳۴۵۶۷۸"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  دوره آموزشی ثبت‌نامی <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({(c.discountPrice || c.price).toLocaleString('fa-IR')} تومان)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    شهریه کل (تومان)
                  </label>
                  <input
                    type="number"
                    value={tuitionTotal}
                    onChange={(e) => setTuitionTotal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    مبلغ پرداختی تاکنون (تومان)
                  </label>
                  <input
                    type="number"
                    value={tuitionPaid}
                    onChange={(e) => setTuitionPaid(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={certificateIssued}
                    onChange={(e) => setCertificateIssued(e.target.checked)}
                    className="rounded text-amber-800 focus:ring-amber-800"
                  />
                  <span className="font-medium text-stone-800">گواهینامه پایان دوره صادر گردید</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  یادداشت و وضعیت هنرجو
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: تسویه قبل از جلسه آزمون / پروژه فوندانت عالی بود"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-800/20 text-xs resize-none"
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
                  className="px-5 py-2 font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs"
                >
                  ذخیره اطلاعات
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
