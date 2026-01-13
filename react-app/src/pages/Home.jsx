import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buttonsAPI, calendarAPI } from '../services/api';
import './Home.css';

function Home() {
  const [orangeButtons, setOrangeButtons] = useState([]);
  const [greenButtons, setGreenButtons] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [allEvents, setAllEvents] = useState({});
  const [eventContent, setEventContent] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);

  useEffect(() => {
    loadButtons();
    loadEvents();
  }, [currentYear, currentMonth]);

  const loadButtons = async () => {
    try {
      const allButtons = await buttonsAPI.getAll();
      setOrangeButtons(allButtons.filter(btn => btn.color === 'orange'));
      setGreenButtons(allButtons.filter(btn => btn.color === 'green'));
    } catch (error) {
      console.error('버튼 로드 실패:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);

      const events = await calendarAPI.getByDateRange(
        formatDate(firstDay),
        formatDate(lastDay)
      );

      const eventsMap = {};
      events.forEach(event => {
        if (!eventsMap[event.eventDate]) {
          eventsMap[event.eventDate] = [];
        }
        eventsMap[event.eventDate].push(event);
      });

      setAllEvents(eventsMap);
    } catch (error) {
      console.error('일정 로드 실패:', error);
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const renderCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const prevLastDay = new Date(currentYear, currentMonth, 0);
    const firstDayOfWeek = firstDay.getDay();
    const lastDate = lastDay.getDate();
    const prevLastDate = prevLastDay.getDate();

    const today = new Date();
    const todayStr = formatDate(today);

    const days = [];

    // 이전 달 날짜
    for (let i = firstDayOfWeek; i > 0; i--) {
      const day = prevLastDate - i + 1;
      const date = new Date(currentYear, currentMonth - 1, day);
      days.push(createDayElement(day, date, true, false));
    }

    // 현재 달 날짜
    for (let day = 1; day <= lastDate; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = formatDate(date);
      const isToday = dateStr === todayStr;
      days.push(createDayElement(day, date, false, isToday));
    }

    // 다음 달 날짜
    const totalCells = firstDayOfWeek + lastDate;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      days.push(createDayElement(day, date, true, false));
    }

    return days;
  };

  const createDayElement = (day, date, isOtherMonth, isToday) => {
    const dateStr = formatDate(date);
    const isSelected = selectedDate === dateStr;
    const events = allEvents[dateStr] || [];

    let className = 'calendar-day';
    if (isOtherMonth) className += ' other-month';
    if (isToday) className += ' today';
    if (isSelected) className += ' selected';

    return (
      <div key={dateStr} className={className} onClick={() => selectDate(date)}>
        <div className="day-number">{day}</div>
        <div className="day-events">
          {events.map((event, idx) => (
            <div
              key={idx}
              className="event-dot"
              style={{
                backgroundColor: event.backgroundColor,
                color: event.textColor
              }}
              title={event.title}
            >
              {event.title}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const selectDate = (date) => {
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
    setShowEventForm(true);
  };

  const saveEvent = async (e) => {
    e.preventDefault();

    if (!eventContent.trim()) return;

    try {
      const eventData = {
        title: eventContent,
        content: null,
        eventDate: selectedDate,
        category: '메모',
        backgroundColor: '#3b82f6',
        textColor: '#ffffff',
        completed: false
      };

      await calendarAPI.create(eventData);
      setEventContent('');
      loadEvents();
    } catch (error) {
      console.error('일정 저장 실패:', error);
      alert('메모 저장에 실패했습니다.');
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm('이 일정을 삭제하시겠습니까?')) return;

    try {
      await calendarAPI.delete(eventId);
      loadEvents();
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      alert('일정 삭제에 실패했습니다.');
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;
  const selectedEvents = selectedDate ? (allEvents[selectedDate] || []) : [];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">참신한 게시대 현수막 아지트</h1>
          <p className="hero-subtitle">지역별 게시대를 쉽게 찾고, 현수막을 효율적으로 관리하세요</p>
          <Link to="/map" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.9rem 1.8rem' }}>
            <i className="fas fa-search"></i> 지도에서 게시대 찾기
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <main>
        {/* Hero Image 1 */}
        <div className="container">
          <div className="hero-image">
            <i className="fas fa-image" style={{ fontSize: '3rem', opacity: 0.3, marginRight: '1rem' }}></i>
            <span>Hero Image 1 (이미지 영역)</span>
          </div>
        </div>

        {/* Orange Buttons Section */}
        <section className="section">
          <div className="container">
            <h2 className="section-title">경북협회사이트</h2>
            {orangeButtons.length > 0 ? (
              <div className="button-grid">
                {orangeButtons.map(button => (
                  <a
                    key={button.id}
                    href={button.url}
                    className="btn btn-orange"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className={`${button.iconClass} btn-icon`}></i>
                    <span>{button.name}</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="no-buttons">
                <i className="fas fa-info-circle" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                <p>등록된 버튼이 없습니다. <Link to="/admin/buttons" style={{ color: 'var(--primary-blue)', textDecoration: 'underline' }}>관리자 페이지</Link>에서 버튼을 추가하세요.</p>
              </div>
            )}
          </div>
        </section>

        {/* Hero Image 2 */}
        <div className="container">
          <div className="hero-image">
            <i className="fas fa-image" style={{ fontSize: '3rem', opacity: 0.3, marginRight: '1rem' }}></i>
            <span>Hero Image 2 (이미지 영역)</span>
          </div>
        </div>

        {/* Green Buttons Section */}
        <section className="section">
          <div className="container">
            <h2 className="section-title">경남협회사이트</h2>
            {greenButtons.length > 0 ? (
              <div className="button-grid">
                {greenButtons.map(button => (
                  <a
                    key={button.id}
                    href={button.url}
                    className="btn btn-green"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className={`${button.iconClass} btn-icon`}></i>
                    <span>{button.name}</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="no-buttons">
                <i className="fas fa-info-circle" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                <p>등록된 버튼이 없습니다. <Link to="/admin/buttons" style={{ color: 'var(--primary-blue)', textDecoration: 'underline' }}>관리자 페이지</Link>에서 버튼을 추가하세요.</p>
              </div>
            )}
          </div>
        </section>

        {/* Calendar Section */}
        <section className="calendar-section">
          <div className="container">
            <h2 className="section-title">일정 관리</h2>
            <div className="calendar-container">
              <div className="calendar-header">
                <h3>{currentYear}년 {monthNames[currentMonth]}</h3>
                <div className="calendar-nav">
                  <button onClick={prevMonth}><i className="fas fa-chevron-left"></i></button>
                  <button onClick={goToToday}><i className="fas fa-calendar-day"></i></button>
                  <button onClick={nextMonth}><i className="fas fa-chevron-right"></i></button>
                </div>
              </div>

              <div className="calendar-grid">
                <div className="calendar-day-header">일</div>
                <div className="calendar-day-header">월</div>
                <div className="calendar-day-header">화</div>
                <div className="calendar-day-header">수</div>
                <div className="calendar-day-header">목</div>
                <div className="calendar-day-header">금</div>
                <div className="calendar-day-header">토</div>
              </div>
              <div className="calendar-grid">
                {renderCalendar()}
              </div>

              {/* Event Form */}
              {showEventForm && (
                <div className="event-form-container active">
                  <div className="event-form-header">
                    <span className="event-form-title">
                      {selectedDateObj && `${selectedDateObj.getFullYear()}년 ${selectedDateObj.getMonth() + 1}월 ${selectedDateObj.getDate()}일`}
                    </span>
                    <button onClick={() => setShowEventForm(false)} className="close-form-btn">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>

                  <form onSubmit={saveEvent}>
                    <div className="form-group">
                      <textarea
                        value={eventContent}
                        onChange={(e) => setEventContent(e.target.value)}
                        rows="3"
                        required
                        placeholder="메모를 입력하세요 (엔터로 줄바꿈 가능)"
                      />
                    </div>
                    <button type="submit">
                      <i className="fas fa-plus"></i> 추가
                    </button>
                  </form>

                  {/* Event List */}
                  <div className="event-list">
                    {selectedEvents.map(event => (
                      <div key={event.id} className="event-item">
                        <div className="event-content">
                          {event.title.split('\n').map((line, idx) => (
                            <div key={idx} style={{ padding: '0.25rem 0', color: 'var(--text-dark)' }}>
                              {line || '\u00A0'}
                            </div>
                          ))}
                        </div>
                        <div className="event-actions">
                          <button onClick={() => deleteEvent(event.id)} title="삭제">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <h2 className="section-title">주요 기능</h2>
            <div className="features-grid">
              <div className="feature-card card">
                <i className="fas fa-map-marked-alt feature-icon"></i>
                <h3 className="feature-title">지도 기반 검색</h3>
                <p className="feature-description">
                  지도에서 게시대 위치를 한눈에 확인하고 검색하세요
                </p>
              </div>
              <div className="feature-card card">
                <i className="fas fa-map-pin feature-icon"></i>
                <h3 className="feature-title">위치 관리</h3>
                <p className="feature-description">
                  게시대의 정확한 위치와 정보를 관리할 수 있습니다
                </p>
              </div>
              <div className="feature-card card">
                <i className="fas fa-search feature-icon"></i>
                <h3 className="feature-title">빠른 검색</h3>
                <p className="feature-description">
                  주소나 게시대 이름으로 빠르게 검색할 수 있습니다
                </p>
              </div>
              <div className="feature-card card">
                <i className="fas fa-chart-line feature-icon"></i>
                <h3 className="feature-title">효율적 관리</h3>
                <p className="feature-description">
                  현수막 게시 일정과 정보를 효율적으로 관리하세요
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
