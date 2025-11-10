import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { Button, Alert, Radio, RadioGroup, FormControlLabel, CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "../../pages/games/games.css";

interface Question {
  question: string;
  options: string[];
}

const MinigamePage: React.FC = () => {
  const { gameId } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; voucher?: any } | null>(null);

  useEffect(() => {
    if (!gameId) return;
    api.get(`/minigame/questions?gameId=${gameId}`)
      .then(res => {
        setQuestions(res.data.questions);
        setAnswers(Array(res.data.questions.length).fill(-1));
      })
      .finally(() => setLoading(false));
  }, [gameId]);

  const handleSelect = (qIdx: number, optIdx: number) => {
    const newAns = [...answers];
    newAns[qIdx] = optIdx;
    setAnswers(newAns);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const userId = localStorage.getItem("userId") || 1;
      const res = await api.post(`/minigame/play?gameId=${gameId}`,
        { answers, userId: Number(userId) }
      );
      setResult(res.data);
    } catch (err) {
      setResult({ success: false, message: "Có lỗi xảy ra!" });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (result && result.success) {
      Swal.fire({
        icon: "success",
        title: "Chúc mừng bạn đã nhận được voucher!",
        html: `
          <div style="margin-top:8px;text-align:left">
            <b>Mã voucher:</b> ${result.voucher.code} <br/>
            <b>Giá trị:</b> ${result.voucher.discountValue} VNĐ <br/>
            <b>Hạn dùng:</b> ${result.voucher.endDate?.slice(0, 10)}
          </div>
        `,
        confirmButtonText: "Đóng"
      });
    }
  }, [result]);

  if (loading) return <CircularProgress />;

  return (
    <div className="minigame-container">
      <div className="minigame-title">Minigame</div>
      {result && (
        <Alert
          className="minigame-alert"
          severity={result.success ? "success" : "error"}
        >
          {result.success
            ? (
              <>
                Chúc mừng bạn đã nhận được voucher!
                <div className="minigame-voucher-info">
                  <strong>Mã voucher:</strong> {result.voucher.code} <br />
                  <strong>Giá trị:</strong> {result.voucher.discountValue} VNĐ <br />
                  <strong>Hạn dùng:</strong> {result.voucher.endDate?.slice(0, 10)}
                </div>
              </>
            )
            : result.message
          }
        </Alert>
      )}
      {questions.map((q, idx) => (
        <div className="minigame-question-card" key={idx}>
          <div className="minigame-question-title">{idx + 1}. {q.question}</div>
          <RadioGroup
            value={answers[idx]}
            onChange={e => handleSelect(idx, Number(e.target.value))}
          >
            {q.options.map((opt, oidx) => (
              <FormControlLabel
                key={oidx}
                value={oidx}
                control={<Radio />}
                label={opt}
                disabled={!!result?.success}
              />
            ))}
          </RadioGroup>
        </div>
      ))}
      <Button
        className="minigame-submit-btn"
        variant="contained"
        color="primary"
        disabled={submitting || answers.includes(-1) || !!result?.success}
        onClick={handleSubmit}
        fullWidth
      >
        {submitting ? "Đang kiểm tra..." : "Nhận voucher"}
      </Button>
    </div>
  );
};

export default MinigamePage;
